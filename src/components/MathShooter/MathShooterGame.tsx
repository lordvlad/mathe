import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import type { CompanionAnimal } from '@/types';
import {
  colsInRow,
  dropFloating,
  fillTopRows,
  findSnapCell,
  getLevelConfig,
  isGridEmpty,
  placeAndResolve,
  randomInt,
  cellCenter,
  createGrid,
  type Grid,
  type Geometry,
  type MergeOutcome,
  type DropOutcome,
} from '@/lib/mathShooter';
import { animalAssets } from '@/assets';
import { Button } from '../Button';
import styles from './MathShooterGame.module.css';

interface MathShooterGameProps {
  animal: CompanionAnimal;
  onExit: () => void;
}

// Logical (unscaled) play field — the canvas is CSS-scaled to fit the viewport.
const WIDTH = 480;
const HEIGHT = 640;
const COLS = 8;
const RADIUS = 26;
const GEO: Geometry = { originX: 32, originY: 16, radius: RADIUS };
const ROW_HEIGHT = RADIUS * 2 * 0.87;
const ROWS = 10;
const DANGER_ROW = ROWS - 2;
const PLAY_LEFT = GEO.originX;
const PLAY_RIGHT = GEO.originX + COLS * RADIUS * 2;
const CANNON_Y = 600;
const CANNON_X = WIDTH / 2;
const PROJECTILE_SPEED = 640; // px/sec

type Status = 'playing' | 'levelComplete' | 'gameOver';

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  value: number;
}

function drawMarbleTexture(value: number): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  const hue = (value * 47) % 360;
  const gradient = ctx.createRadialGradient(size * 0.35, size * 0.32, size * 0.06, size * 0.5, size * 0.5, size * 0.52);
  gradient.addColorStop(0, `hsl(${hue}, 95%, 85%)`);
  gradient.addColorStop(0.55, `hsl(${hue}, 80%, 62%)`);
  gradient.addColorStop(1, `hsl(${hue}, 70%, 40%)`);

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = `hsl(${hue}, 70%, 30%)`;
  ctx.stroke();

  ctx.font = 'bold 58px "Comic Sans MS", system-ui, sans-serif';
  ctx.fillStyle = '#2D3748';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(value), size / 2, size / 2 + 6);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function drawCannonTexture(): THREE.CanvasTexture {
  const size = 96;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = '#4A5568';
  ctx.beginPath();
  ctx.moveTo(-16, 20);
  ctx.lineTo(16, 20);
  ctx.lineTo(9, -30);
  ctx.lineTo(-9, -30);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 20, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#2D3748';
  ctx.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function drawSparkleTexture(): THREE.CanvasTexture {
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.55)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function MathShooterGame({ animal, onExit }: MathShooterGameProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<Status>('playing');
  const [nextValue, setNextValue] = useState(0);

  // Mutable game state lives in refs so the render loop never fights React's
  // render cycle; React state above only drives the HUD.
  const gridRef = useRef<Grid>(createGrid(ROWS, COLS));
  const targetRef = useRef(10);
  const valueRangeRef = useRef<[number, number]>([1, 4]);
  const statusRef = useRef<Status>('playing');
  const projectileRef = useRef<Projectile | null>(null);
  const currentValueRef = useRef(0);
  const nextValueRef = useRef(0);
  const aimRef = useRef({ x: CANNON_X, y: 0 });
  const levelRef = useRef(1);
  const advanceRef = useRef<(levelNumber: number) => void>(() => {});
  const animatingRef = useRef(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(WIDTH, HEIGHT, false);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // World space mirrors pixel space with y flipped downward (worldY = -pixelY).
    const camera = new THREE.OrthographicCamera(0, WIDTH, 0, -HEIGHT, 0.1, 100);
    camera.position.z = 10;

    const textureCache = new Map<number, THREE.CanvasTexture>();
    const marbleTexture = (value: number) => {
      let tex = textureCache.get(value);
      if (!tex) {
        tex = drawMarbleTexture(value);
        textureCache.set(value, tex);
      }
      return tex;
    };

    const marbleGroup = new THREE.Group();
    scene.add(marbleGroup);
    const spriteMap = new Map<string, THREE.Sprite>();

    // Renders `grid` as-is (used both for the logical grid and for the
    // in-between "display" states the merge animation steps through).
    const renderGrid = (grid: Grid) => {
      marbleGroup.clear();
      spriteMap.clear();
      for (let r = 0; r < grid.length; r++) {
        const gridRow = grid[r];
        if (!gridRow) continue;
        const count = colsInRow(r, COLS);
        for (let c = 0; c < count; c++) {
          const marble = gridRow[c];
          if (!marble) continue;
          const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({ map: marbleTexture(marble.value), transparent: true }),
          );
          const { x, y } = cellCenter(r, c, GEO);
          sprite.position.set(x, -y, 0);
          sprite.scale.set(RADIUS * 2, RADIUS * 2, 1);
          marbleGroup.add(sprite);
          spriteMap.set(`${r},${c}`, sprite);
        }
      }
    };
    const rebuildMarbles = () => renderGrid(gridRef.current);
    rebuildMarbles();

    const projectileSprite = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true }));
    projectileSprite.scale.set(RADIUS * 2, RADIUS * 2, 1);
    projectileSprite.position.z = 3;
    projectileSprite.visible = false;
    scene.add(projectileSprite);

    const previewSprite = new THREE.Sprite(new THREE.SpriteMaterial());
    previewSprite.position.set(CANNON_X, -CANNON_Y, 2);
    previewSprite.scale.set(RADIUS * 2, RADIUS * 2, 1);
    scene.add(previewSprite);

    const nextSprite = new THREE.Sprite(new THREE.SpriteMaterial());
    nextSprite.position.set(CANNON_X + 70, -CANNON_Y + 4, 2);
    nextSprite.scale.set(RADIUS * 1.1, RADIUS * 1.1, 1);
    scene.add(nextSprite);

    const cannonSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: drawCannonTexture() }));
    cannonSprite.position.set(CANNON_X, -CANNON_Y, 1);
    cannonSprite.scale.set(64, 64, 1);
    scene.add(cannonSprite);

    const aimGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(CANNON_X, -CANNON_Y, 0),
      new THREE.Vector3(CANNON_X, 0, 0),
    ]);
    const aimLine = new THREE.Line(aimGeometry, new THREE.LineDashedMaterial({ color: 0x718096, dashSize: 8, gapSize: 6 }));
    aimLine.computeLineDistances();
    scene.add(aimLine);

    const dangerGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(PLAY_LEFT, -(GEO.originY + RADIUS + DANGER_ROW * ROW_HEIGHT), 0),
      new THREE.Vector3(PLAY_RIGHT, -(GEO.originY + RADIUS + DANGER_ROW * ROW_HEIGHT), 0),
    ]);
    const dangerLine = new THREE.Line(dangerGeometry, new THREE.LineDashedMaterial({ color: 0xff8a80, dashSize: 6, gapSize: 5 }));
    dangerLine.computeLineDistances();
    scene.add(dangerLine);

    // --- Tween + particle helpers for the merge/pop animation ---------------
    interface Tween {
      start: number;
      duration: number;
      update: (t: number) => void;
      resolve: () => void;
    }
    const tweens: Tween[] = [];
    const addTween = (duration: number, update: (t: number) => void) =>
      new Promise<void>((resolve) => {
        tweens.push({ start: performance.now(), duration: Math.max(duration, 1), update, resolve });
      });

    interface Particle {
      sprite: THREE.Sprite;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
    }
    const particles: Particle[] = [];
    const sparkleTexture = drawSparkleTexture();
    const spawnSparkles = (x: number, y: number, value: number) => {
      const hue = (value * 47) % 360;
      for (let i = 0; i < 10; i++) {
        const material = new THREE.SpriteMaterial({
          map: sparkleTexture,
          color: new THREE.Color(`hsl(${hue}, 90%, 78%)`),
          transparent: true,
          depthWrite: false,
        });
        const sprite = new THREE.Sprite(material);
        const size = 8 + Math.random() * 10;
        sprite.scale.set(size, size, 1);
        sprite.position.set(x, -y, 4);
        scene.add(sprite);
        const angle = Math.random() * Math.PI * 2;
        const speed = 70 + Math.random() * 110;
        particles.push({
          sprite,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 0.4 + Math.random() * 0.3,
        });
      }
    };

    const spawnLevel = (levelNumber: number) => {
      const config = getLevelConfig(levelNumber);
      levelRef.current = levelNumber;
      targetRef.current = config.target;
      valueRangeRef.current = config.valueRange;
      gridRef.current = fillTopRows(ROWS, COLS, config.initialRows, config.valueRange);
      currentValueRef.current = randomInt(config.valueRange[0], config.valueRange[1]);
      nextValueRef.current = randomInt(config.valueRange[0], config.valueRange[1]);
      setLevel(levelNumber);
      setNextValue(nextValueRef.current);
      rebuildMarbles();
    };
    spawnLevel(1);

    const updatePreviewSprites = () => {
      previewSprite.material.map = marbleTexture(currentValueRef.current);
      previewSprite.material.needsUpdate = true;
      nextSprite.material.map = marbleTexture(nextValueRef.current);
      nextSprite.material.needsUpdate = true;
    };
    updatePreviewSprites();

    const MERGE_STEP_MS = 240;
    const POP_PAUSE_MS = 160;
    const DROP_MS = 340;

    // Steps the display through the merge cascade and floater drop one beat
    // at a time: absorbed marbles slide into the marble they matched before
    // vanishing, popped marbles burst into sparkles, stranded marbles fall,
    // and only then does the next shot become available.
    const animateSettlement = async (preMergeGrid: Grid, merge: MergeOutcome, drop: DropOutcome) => {
      renderGrid(preMergeGrid);

      for (const step of merge.steps) {
        const fromCenter = cellCenter(step.from.row, step.from.col, GEO);
        const toCenter = cellCenter(step.to.row, step.to.col, GEO);
        const midX = (fromCenter.x + toCenter.x) / 2;
        const midY = (fromCenter.y + toCenter.y) / 2;
        const fromKey = `${step.from.row},${step.from.col}`;
        const toKey = `${step.to.row},${step.to.col}`;
        const fromSprite = spriteMap.get(fromKey);
        const toSprite = spriteMap.get(toKey);

        await addTween(MERGE_STEP_MS, (t) => {
          if (fromSprite) {
            fromSprite.position.set(
              fromCenter.x + (midX - fromCenter.x) * t,
              -(fromCenter.y + (midY - fromCenter.y) * t),
              0,
            );
            fromSprite.material.opacity = 1 - t;
            const shrink = RADIUS * 2 * (1 - 0.5 * t);
            fromSprite.scale.set(shrink, shrink, 1);
          }
          if (toSprite) {
            const pulse = 1 + 0.22 * Math.sin(t * Math.PI);
            toSprite.scale.set(RADIUS * 2 * pulse, RADIUS * 2 * pulse, 1);
          }
        });

        if (fromSprite) {
          marbleGroup.remove(fromSprite);
          fromSprite.material.dispose();
          spriteMap.delete(fromKey);
        }

        if (step.popped) {
          if (toSprite) {
            marbleGroup.remove(toSprite);
            toSprite.material.dispose();
            spriteMap.delete(toKey);
          }
          spawnSparkles(toCenter.x, toCenter.y, step.resultValue);
          setScore((prev) => prev + step.resultValue);
          await addTween(POP_PAUSE_MS, () => {});
        } else if (toSprite) {
          toSprite.scale.set(RADIUS * 2, RADIUS * 2, 1);
          toSprite.material.map = marbleTexture(step.resultValue);
          toSprite.material.needsUpdate = true;
        }
      }

      if (drop.dropped.length > 0) {
        await Promise.all(
          drop.dropped.map(async (marble) => {
            const key = `${marble.row},${marble.col}`;
            const sprite = spriteMap.get(key);
            if (!sprite) return;
            const start = cellCenter(marble.row, marble.col, GEO);
            await addTween(DROP_MS, (t) => {
              sprite.position.set(start.x, -(start.y + 90 * t * t), 0);
              sprite.material.opacity = 1 - t;
            });
            marbleGroup.remove(sprite);
            sprite.material.dispose();
            spriteMap.delete(key);
          }),
        );
        setScore((prev) => prev + drop.dropped.reduce((sum, marble) => sum + marble.value, 0));
      }

      // Guarantee the display exactly matches logical truth once the
      // animation settles (defends against any step/drop desync).
      renderGrid(gridRef.current);

      if (isGridEmpty(gridRef.current)) {
        statusRef.current = 'levelComplete';
        setStatus('levelComplete');
        animatingRef.current = false;
        return;
      }

      const dangerHit = gridRef.current
        .slice(DANGER_ROW)
        .some((row, idx) => row.slice(0, colsInRow(DANGER_ROW + idx, COLS)).some((cell) => cell !== null));
      if (dangerHit) {
        statusRef.current = 'gameOver';
        setStatus('gameOver');
        animatingRef.current = false;
        return;
      }

      currentValueRef.current = nextValueRef.current;
      nextValueRef.current = randomInt(valueRangeRef.current[0], valueRangeRef.current[1]);
      setNextValue(nextValueRef.current);
      updatePreviewSprites();
      animatingRef.current = false;
    };

    const settleProjectile = (x: number, y: number) => {
      const projectile = projectileRef.current;
      if (!projectile) return;
      const snap = findSnapCell(gridRef.current, COLS, x, y, GEO);
      if (!snap) {
        statusRef.current = 'gameOver';
        setStatus('gameOver');
        projectileRef.current = null;
        projectileSprite.visible = false;
        return;
      }

      const preMergeGrid = gridRef.current.map((r) => [...r]);
      const preMergeRow = preMergeGrid[snap.row];
      if (preMergeRow) preMergeRow[snap.col] = { value: projectile.value };

      const merge = placeAndResolve(gridRef.current, COLS, snap.row, snap.col, projectile.value, targetRef.current);
      const drop = dropFloating(merge.grid, COLS);
      gridRef.current = drop.grid;

      projectileRef.current = null;
      projectileSprite.visible = false;
      animatingRef.current = true;

      void animateSettlement(preMergeGrid, merge, drop);
    };

    let lastTime = performance.now();
    renderer.setAnimationLoop((time) => {
      const dt = Math.min((time - lastTime) / 1000, 1 / 30);
      lastTime = time;

      const now = performance.now();
      for (let i = tweens.length - 1; i >= 0; i--) {
        const tw = tweens[i];
        if (!tw) continue;
        const t = Math.min(1, (now - tw.start) / tw.duration);
        tw.update(t);
        if (t >= 1) {
          tweens.splice(i, 1);
          tw.resolve();
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p) continue;
        p.life += dt;
        const lt = p.life / p.maxLife;
        if (lt >= 1) {
          scene.remove(p.sprite);
          p.sprite.material.dispose();
          particles.splice(i, 1);
          continue;
        }
        p.sprite.position.x += p.vx * dt;
        p.sprite.position.y -= p.vy * dt;
        p.sprite.material.opacity = 1 - lt;
      }

      const projectile = projectileRef.current;
      if (projectile && statusRef.current === 'playing') {
        let steps = 6;
        const stepDt = dt / steps;
        while (steps > 0 && projectileRef.current) {
          const p = projectileRef.current;
          p.x += p.vx * stepDt;
          p.y += p.vy * stepDt;

          if (p.x - RADIUS < PLAY_LEFT) {
            p.x = PLAY_LEFT + RADIUS;
            p.vx *= -1;
          } else if (p.x + RADIUS > PLAY_RIGHT) {
            p.x = PLAY_RIGHT - RADIUS;
            p.vx *= -1;
          }

          if (p.y - RADIUS <= GEO.originY) {
            settleProjectile(p.x, GEO.originY + RADIUS);
            break;
          }

          let hit = false;
          const grid = gridRef.current;
          for (let r = 0; r < grid.length && !hit; r++) {
            const gridRow = grid[r];
            if (!gridRow) continue;
            const count = colsInRow(r, COLS);
            for (let c = 0; c < count; c++) {
              const marble = gridRow[c];
              if (!marble) continue;
              const center = cellCenter(r, c, GEO);
              if (Math.hypot(center.x - p.x, center.y - p.y) <= RADIUS * 2) {
                settleProjectile(p.x, p.y);
                hit = true;
                break;
              }
            }
          }
          if (hit) break;
          steps -= 1;
        }

        if (projectileRef.current) {
          projectileSprite.position.set(projectileRef.current.x, -projectileRef.current.y, 3);
        }
      }

      const aim = aimRef.current;
      const dx = aim.x - CANNON_X;
      const dy = aim.y - CANNON_Y;
      const angle = Math.atan2(dx, -dy);
      cannonSprite.material.rotation = angle;
      const len = Math.max(1, Math.hypot(dx, dy));
      const aimX = CANNON_X + (dx / len) * Math.min(len, 90);
      const aimY = CANNON_Y + (dy / len) * Math.min(len, 90);
      const positions = aimLine.geometry.attributes.position as THREE.BufferAttribute;
      positions.setXYZ(0, CANNON_X, -CANNON_Y, 0);
      positions.setXYZ(1, aimX, -aimY, 0);
      positions.needsUpdate = true;

      renderer.render(scene, camera);
    });

    const container = mount;
    const shoot = () => {
      if (statusRef.current !== 'playing' || projectileRef.current || animatingRef.current) return;
      const aim = aimRef.current;
      const dx = aim.x - CANNON_X;
      const dy = aim.y - CANNON_Y;
      const len = Math.max(1, Math.hypot(dx, dy));
      projectileRef.current = {
        x: CANNON_X,
        y: CANNON_Y,
        vx: (dx / len) * PROJECTILE_SPEED,
        vy: (dy / len) * PROJECTILE_SPEED,
        value: currentValueRef.current,
      };
      projectileSprite.material.map = marbleTexture(currentValueRef.current);
      projectileSprite.material.needsUpdate = true;
      projectileSprite.visible = true;
    };

    const pointerToLogical = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const scaleX = WIDTH / rect.width;
      const scaleY = HEIGHT / rect.height;
      return {
        x: Math.min(PLAY_RIGHT, Math.max(PLAY_LEFT, (clientX - rect.left) * scaleX)),
        y: Math.min(CANNON_Y - 10, Math.max(0, (clientY - rect.top) * scaleY)),
      };
    };
    const handlePointerMove = (event: PointerEvent) => {
      aimRef.current = pointerToLogical(event.clientX, event.clientY);
    };
    const handlePointerDown = (event: PointerEvent) => {
      aimRef.current = pointerToLogical(event.clientX, event.clientY);
      shoot();
    };
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerdown', handlePointerDown);

    advanceRef.current = (levelNumber: number) => {
      statusRef.current = 'playing';
      setStatus('playing');
      spawnLevel(levelNumber);
    };

    return () => {
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerdown', handlePointerDown);
      renderer.setAnimationLoop(null);
      renderer.dispose();
      textureCache.forEach((tex) => tex.dispose());
      sparkleTexture.dispose();
      particles.forEach((p) => p.sprite.material.dispose());
      mount.removeChild(renderer.domElement);
    };
    // Intentionally run once per game screen; `spawnLevel`/`settleProjectile` close
    // over refs, not stale state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNextLevel = () => advanceRef.current(levelRef.current + 1);

  const handleRetry = () => {
    setScore(0);
    advanceRef.current(1);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.hud}>
        <button className={styles.exitButton} onClick={onExit} aria-label="Zurück zum Spielmenü" data-testid="shooter-exit">
          ⬅️
        </button>
        <img src={animalAssets[animal]} alt={animal} className={styles.mascot} />
        <div className={styles.stats}>
          <span data-testid="shooter-level">Level {level}</span>
          <span data-testid="shooter-score">Punkte: {score}</span>
          <span data-testid="shooter-target">Ziel: {targetRef.current}</span>
          <span data-testid="shooter-next">Nächste Zahl: {nextValue}</span>
        </div>
      </div>

      <div className={styles.canvasFrame} ref={mountRef} />

      <p className={styles.hint}>Ziele mit der Maus und tippe zum Schießen. Gleiche Zahlen verschmelzen!</p>

      {status === 'levelComplete' && (
        <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="shooter-level-complete">
          <div className={styles.overlayCard}>
            <h2>Level geschafft! 🎉</h2>
            <p>Punkte: {score}</p>
            <Button onClick={handleNextLevel}>Nächstes Level</Button>
          </div>
        </motion.div>
      )}

      {status === 'gameOver' && (
        <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="shooter-game-over">
          <div className={styles.overlayCard}>
            <h2>Spiel vorbei</h2>
            <p>Punkte: {score}</p>
            <Button onClick={handleRetry}>Nochmal spielen</Button>
            <Button variant="secondary" onClick={onExit}>Zum Menü</Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
