import { describe, test, expect } from 'bun:test';
import {
  getLevelConfig,
  colsInRow,
  createGrid,
  neighborsOf,
  fillTopRows,
  findSnapCell,
  placeAndResolve,
  dropFloating,
  isGridEmpty,
  cellCenter,
  type Grid,
} from './mathShooter';

const GEO = { originX: 10, originY: 10, radius: 20 };

describe('mathShooter', () => {
  describe('getLevelConfig', () => {
    test('level 1 targets 10, level 2 targets 20', () => {
      expect(getLevelConfig(1).target).toBe(10);
      expect(getLevelConfig(2).target).toBe(20);
      expect(getLevelConfig(3).target).toBe(30);
    });
  });

  describe('colsInRow', () => {
    test('odd rows have one fewer column than even rows', () => {
      expect(colsInRow(0, 8)).toBe(8);
      expect(colsInRow(1, 8)).toBe(7);
      expect(colsInRow(2, 8)).toBe(8);
    });
  });

  describe('neighborsOf', () => {
    test('even row neighbors lean left, odd row neighbors lean right', () => {
      expect(neighborsOf(2, 3)).toContainEqual([1, 2]);
      expect(neighborsOf(2, 3)).toContainEqual([1, 3]);
      expect(neighborsOf(3, 3)).toContainEqual([2, 3]);
      expect(neighborsOf(3, 3)).toContainEqual([2, 4]);
    });
  });

  describe('fillTopRows / isGridEmpty', () => {
    test('fills exactly the requested rows and leaves the rest empty', () => {
      const grid = fillTopRows(6, 8, 2, [1, 5], () => 0.5);
      expect(grid[0]!.slice(0, colsInRow(0, 8)).every((c) => c !== null)).toBe(true);
      expect(grid[1]!.slice(0, colsInRow(1, 8)).every((c) => c !== null)).toBe(true);
      expect(grid[2]!.every((c) => c === null)).toBe(true);
      expect(isGridEmpty(grid)).toBe(false);
    });

    test('empty grid reports empty', () => {
      expect(isGridEmpty(createGrid(6, 8))).toBe(true);
    });
  });

  describe('findSnapCell', () => {
    test('snaps to the empty cell nearest the collision point', () => {
      const grid = createGrid(6, 8);
      const target = cellCenter(2, 3, GEO);
      const snap = findSnapCell(grid, 8, target.x + 2, target.y - 1, GEO);
      expect(snap).toEqual({ row: 2, col: 3 });
    });

    test('skips occupied cells', () => {
      const grid = createGrid(6, 8);
      grid[2]![3] = { value: 4 };
      const target = cellCenter(2, 3, GEO);
      const snap = findSnapCell(grid, 8, target.x, target.y, GEO);
      expect(snap).not.toEqual({ row: 2, col: 3 });
    });
  });

  describe('placeAndResolve', () => {
    test('places a marble with no neighbors and does not merge', () => {
      const grid = createGrid(4, 8);
      const result = placeAndResolve(grid, 8, 3, 0, 4, 10);
      expect(result.merged).toBe(false);
      expect(result.grid[3]![0]).toEqual({ value: 4 });
      expect(result.popped).toHaveLength(0);
    });

    test('merges two equal-value neighbors into their sum', () => {
      const grid = createGrid(4, 8);
      grid[3]![1] = { value: 4 };
      const result = placeAndResolve(grid, 8, 3, 0, 4, 10);
      expect(result.merged).toBe(true);
      expect(result.grid[3]![1]).toBeNull();
      expect(result.grid[3]![0]).toEqual({ value: 8 });
      expect(result.popped).toHaveLength(0);
    });

    test('pops the marble once its merged value reaches the target', () => {
      const grid = createGrid(4, 8);
      grid[3]![1] = { value: 5 };
      const result = placeAndResolve(grid, 8, 3, 0, 5, 10);
      expect(result.grid[3]![0]).toBeNull();
      expect(result.grid[3]![1]).toBeNull();
      expect(result.popped).toEqual([{ row: 3, col: 0, value: 10 }]);
      expect(result.scoreGained).toBe(10);
    });

    test('cascades through a chain of equal values before popping', () => {
      const grid = createGrid(4, 8);
      // (2,0)=2 -> merges with (2,1)=2 => 4 -> merges with (1,0)=4 => 8 -> merges with (3,0)=8 => 16 pops (target 10)
      grid[2]![1] = { value: 2 };
      grid[1]![0] = { value: 4 };
      grid[3]![0] = { value: 8 };
      const result = placeAndResolve(grid, 8, 2, 0, 2, 10);
      expect(result.popped[0]?.value).toBe(16);
      expect(result.grid[2]![1]).toBeNull();
      expect(result.grid[1]![0]).toBeNull();
      expect(result.grid[3]![0]).toBeNull();
    });
  });

  describe('dropFloating', () => {
    test('keeps marbles connected to the ceiling', () => {
      const grid: Grid = createGrid(3, 8);
      grid[0]![0] = { value: 1 };
      grid[1]![0] = { value: 2 };
      const { grid: after, dropped } = dropFloating(grid, 8);
      expect(dropped).toHaveLength(0);
      expect(after[1]![0]).toEqual({ value: 2 });
    });

    test('drops marbles disconnected from the ceiling', () => {
      const grid: Grid = createGrid(3, 8);
      grid[0]![0] = { value: 1 };
      // Row 2 marble has no path back to row 0 once its only link is removed.
      grid[2]![5] = { value: 3 };
      const { grid: after, dropped } = dropFloating(grid, 8);
      expect(dropped).toEqual([{ row: 2, col: 5, value: 3 }]);
      expect(after[2]![5]).toBeNull();
    });
  });
});
