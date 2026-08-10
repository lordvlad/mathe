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

    const rebuildMarbles = () => {
      marbleGroup.clear();
      const grid = gridRef.current;
      for (let r = 0; r < grid.length; r++) {
        const gridRow = grid[r];
        if (!gridRow) continue;
        const count = colsInRow(r, COLS);
        for (let c = 0; c < count; c++) {
          const marble = gridRow[c];
          if (!marble) continue;
          const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: marbleTexture(marble.value) }));
          const { x, y } = cellCenter(r, c, GEO);
          sprite.position.set(x, -y, 0);
          sprite.scale.set(RADIUS * 2, RADIUS * 2, 1);
          marbleGroup.add(sprite);
        }
      }
    };
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

      const merge = placeAndResolve(gridRef.current, COLS, snap.row, snap.col, projectile.value, targetRef.current);
      const drop = dropFloating(merge.grid, COLS);
      gridRef.current = drop.grid;

      const gained = merge.scoreGained + drop.dropped.reduce((sum, marble) => sum + marble.value, 0);
      if (gained > 0) setScore((prev) => prev + gained);

      projectileRef.current = null;
      projectileSprite.visible = false;
      rebuildMarbles();

      if (isGridEmpty(gridRef.current)) {
        statusRef.current = 'levelComplete';
        setStatus('levelComplete');
        return;
      }

      const dangerHit = gridRef.current
        .slice(DANGER_ROW)
        .some((row, idx) => row.slice(0, colsInRow(DANGER_ROW + idx, COLS)).some((cell) => cell !== null));
      if (dangerHit) {
        statusRef.current = 'gameOver';
        setStatus('gameOver');
        return;
      }

      currentValueRef.current = nextValueRef.current;
      nextValueRef.current = randomInt(valueRangeRef.current[0], valueRangeRef.current[1]);
      setNextValue(nextValueRef.current);
      updatePreviewSprites();
    };

    let lastTime = performance.now();
    renderer.setAnimationLoop((time) => {
      const dt = Math.min((time - lastTime) / 1000, 1 / 30);
      lastTime = time;

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
      if (statusRef.current !== 'playing' || projectileRef.current) return;
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
