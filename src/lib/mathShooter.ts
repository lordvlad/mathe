/**
 * Core logic for "Zahlen-Schütze" (Math Shooter) — a marble-shooter game
 * where marbles carrying digits merge (sum) on contact with a matching
 * digit and disappear once their value reaches the level's target
 * (10 on level 1, 20 on level 2, 30 on level 3, ...).
 *
 * Kept framework-free and pure so it can be unit tested and driven from a
 * canvas render loop without coupling game logic to React.
 */

export interface Marble {
  value: number;
}

/** grid[row][col]; odd rows are horizontally offset by half a cell ("odd-r" layout) */
export type Grid = (Marble | null)[][];

export interface Geometry {
  originX: number;
  originY: number;
  radius: number;
}

export interface LevelConfig {
  level: number;
  /** value a merged marble must reach (or exceed) to pop */
  target: number;
  /** rows pre-filled with marbles when the level starts */
  initialRows: number;
  /** inclusive range of digit values used to seed the grid */
  valueRange: [number, number];
}

export interface PoppedMarble {
  row: number;
  col: number;
  value: number;
}

/**
 * One absorption within a merge cascade: the marble at `from` disappears
 * into the growing marble at `to`. `popped` is true when this step's
 * `resultValue` reached the target, so `to` also disappears (with a
 * sparkle) instead of persisting at the new value.
 */
export interface MergeStep {
  from: { row: number; col: number; value: number };
  to: { row: number; col: number };
  resultValue: number;
  popped: boolean;
}

export interface MergeOutcome {
  grid: Grid;
  popped: PoppedMarble[];
  steps: MergeStep[];
  scoreGained: number;
  merged: boolean;
}

export interface DropOutcome {
  grid: Grid;
  dropped: PoppedMarble[];
}

/** Level N pops marbles at 10*N and grows a little harder each level. */
export function getLevelConfig(level: number): LevelConfig {
  return {
    level,
    target: 10 * level,
    initialRows: Math.min(3 + level, 8),
    valueRange: [1, Math.min(3 + level, 9)],
  };
}

/** Odd rows have one fewer column since they are shifted right by half a cell. */
export function colsInRow(row: number, cols: number): number {
  return row % 2 === 0 ? cols : cols - 1;
}

export function createGrid(rows: number, cols: number): Grid {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

export function inBounds(grid: Grid, cols: number, row: number, col: number): boolean {
  return row >= 0 && row < grid.length && col >= 0 && col < colsInRow(row, cols);
}

/** The six neighbor cells of (row, col) in the odd-r offset layout. */
export function neighborsOf(row: number, col: number): [number, number][] {
  const evenRow = row % 2 === 0;
  const deltas: [number, number][] = evenRow
    ? [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]]
    : [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];
  return deltas.map(([dr, dc]) => [row + dr, col + dc]);
}

export function randomInt(min: number, max: number, rng: () => number = Math.random): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Fills the top `filledRows` rows of a fresh grid with random digit marbles. */
export function fillTopRows(
  rows: number,
  cols: number,
  filledRows: number,
  valueRange: [number, number],
  rng: () => number = Math.random,
): Grid {
  const grid = createGrid(rows, cols);
  for (let r = 0; r < Math.min(filledRows, rows); r++) {
    const gridRow = grid[r];
    if (!gridRow) continue;
    const count = colsInRow(r, cols);
    for (let c = 0; c < count; c++) {
      gridRow[c] = { value: randomInt(valueRange[0], valueRange[1], rng) };
    }
  }
  return grid;
}

export function cellCenter(row: number, col: number, geo: Geometry) {
  const cell = geo.radius * 2;
  const rowHeight = cell * 0.87;
  const xOffset = row % 2 === 1 ? geo.radius : 0;
  return {
    x: geo.originX + geo.radius + col * cell + xOffset,
    y: geo.originY + geo.radius + row * rowHeight,
  };
}

export function isGridEmpty(grid: Grid): boolean {
  return grid.every((row) => row.every((cell) => cell === null));
}

/**
 * Finds the empty grid cell whose center is closest to a collision point.
 * Searches the estimated row plus its immediate neighbors so marbles snap
 * next to whatever they actually touched.
 */
export function findSnapCell(
  grid: Grid,
  cols: number,
  x: number,
  y: number,
  geo: Geometry,
): { row: number; col: number } | null {
  const cell = geo.radius * 2;
  const rowHeight = cell * 0.87;
  const estimatedRow = Math.round((y - geo.originY - geo.radius) / rowHeight);

  let best: { row: number; col: number; dist: number } | null = null;
  for (let dr = -1; dr <= 1; dr++) {
    const row = estimatedRow + dr;
    const gridRow = grid[row];
    if (!gridRow) continue;
    const count = colsInRow(row, cols);
    for (let c = 0; c < count; c++) {
      if (gridRow[c]) continue;
      const center = cellCenter(row, c, geo);
      const dist = Math.hypot(center.x - x, center.y - y);
      if (!best || dist < best.dist) best = { row, col: c, dist };
    }
  }
  return best ? { row: best.row, col: best.col } : null;
}

/**
 * Places a marble and resolves the merge chain that follows. A shot marble
 * that touches an existing same-value marble merges *into* it — the
 * pre-existing (already-connected) marble is the one that grows, while the
 * newly landed marble is absorbed and disappears. This keeps a merge chain
 * anchored to wherever it already was in the grid instead of dragging the
 * result toward the freshly shot cell. If a sum reaches `target`, the
 * anchor pops (removed, score awarded) instead of continuing to merge.
 */
export function placeAndResolve(
  grid: Grid,
  cols: number,
  row: number,
  col: number,
  value: number,
  target: number,
): MergeOutcome {
  const g = grid.map((r) => [...r]);

  const anchorMatch = neighborsOf(row, col).find(([r, c]) => {
    if (!inBounds(g, cols, r, c)) return false;
    return g[r]?.[c]?.value === value;
  });

  if (!anchorMatch) {
    const landingRow = g[row];
    if (landingRow) landingRow[col] = { value };
    return { grid: g, popped: [], steps: [], scoreGained: 0, merged: false };
  }

  const cur = { row: anchorMatch[0], col: anchorMatch[1] };
  const anchorRow = g[cur.row];
  const anchorMarble = anchorRow?.[cur.col];
  if (!anchorRow || !anchorMarble) {
    // Unreachable given anchorMatch already confirmed this cell; keeps the
    // function total under strict indexed-access typing.
    const landingRow = g[row];
    if (landingRow) landingRow[col] = { value };
    return { grid: g, popped: [], steps: [], scoreGained: 0, merged: false };
  }

  const popped: PoppedMarble[] = [];
  const steps: MergeStep[] = [];
  let scoreGained = 0;

  // The landed marble is consumed by the anchor immediately — it never
  // occupies (row, col) in the returned grid.
  let currentValue = anchorMarble.value + value;
  let willPop = currentValue >= target;
  steps.push({
    from: { row, col, value },
    to: { row: cur.row, col: cur.col },
    resultValue: currentValue,
    popped: willPop,
  });

  if (willPop) {
    anchorRow[cur.col] = null;
    popped.push({ row: cur.row, col: cur.col, value: currentValue });
    scoreGained += currentValue;
  } else {
    anchorRow[cur.col] = { value: currentValue };

    // Further cascading merges: keep absorbing matching neighbors into the
    // anchor. Guard against pathological loops with a generous cap (grid is
    // tiny).
    for (let iterations = 0; iterations < 64; iterations++) {
      const curRow = g[cur.row];
      if (!curRow) break;
      const marble = curRow[cur.col];
      if (!marble) break;

      const match = neighborsOf(cur.row, cur.col).find(([r, c]) => {
        if (!inBounds(g, cols, r, c)) return false;
        return g[r]?.[c]?.value === marble.value;
      });
      if (!match) break;

      const [nr, nc] = match;
      const neighborRow = g[nr];
      const neighborMarble = neighborRow?.[nc];
      if (!neighborRow || !neighborMarble) break;

      currentValue = marble.value + neighborMarble.value;
      neighborRow[nc] = null;
      willPop = currentValue >= target;
      steps.push({
        from: { row: nr, col: nc, value: neighborMarble.value },
        to: { row: cur.row, col: cur.col },
        resultValue: currentValue,
        popped: willPop,
      });

      if (willPop) {
        curRow[cur.col] = null;
        popped.push({ row: cur.row, col: cur.col, value: currentValue });
        scoreGained += currentValue;
        break;
      }

      curRow[cur.col] = { value: currentValue };
    }
  }

  return { grid: g, popped, steps, scoreGained, merged: true };
}

/**
 * Removes marbles that are no longer connected (directly or transitively)
 * to the ceiling (row 0) — mirrors classic bubble-shooter "floaters" falling.
 * Safe to run after `placeAndResolve`: since merges always anchor at the
 * pre-existing marble, this only ever catches marbles that were genuinely
 * stranded by a pop or by other marbles being cleared away.
 */
export function dropFloating(grid: Grid, cols: number): DropOutcome {
  const rows = grid.length;
  const visited = grid.map((row) => row.map(() => false));
  const stack: [number, number][] = [];

  const firstRow = grid[0];
  const visitedFirstRow = visited[0];
  if (firstRow && visitedFirstRow) {
    for (let c = 0; c < colsInRow(0, cols); c++) {
      if (firstRow[c]) {
        visitedFirstRow[c] = true;
        stack.push([0, c]);
      }
    }
  }

  while (stack.length) {
    const [r, c] = stack.pop() as [number, number];
    for (const [nr, nc] of neighborsOf(r, c)) {
      if (!inBounds(grid, cols, nr, nc)) continue;
      const neighborRow = grid[nr];
      const visitedRow = visited[nr];
      if (neighborRow?.[nc] && visitedRow && !visitedRow[nc]) {
        visitedRow[nc] = true;
        stack.push([nr, nc]);
      }
    }
  }

  const g = grid.map((row) => [...row]);
  const dropped: PoppedMarble[] = [];
  for (let r = 0; r < rows; r++) {
    const gRow = g[r];
    const visitedRow = visited[r];
    if (!gRow || !visitedRow) continue;
    for (let c = 0; c < colsInRow(r, cols); c++) {
      const marble = gRow[c];
      if (marble && !visitedRow[c]) {
        dropped.push({ row: r, col: c, value: marble.value });
        gRow[c] = null;
      }
    }
  }
  return { grid: g, dropped };
}
