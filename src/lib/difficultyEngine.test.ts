import { describe, test, expect } from 'bun:test';
import { calculateDifficulty, shouldCelebrate } from './difficultyEngine';
import type { Difficulty, PerformanceHistory, ProblemAttempt } from '@/types';

const defaultDifficulty: Difficulty = {
  addition: { min: 1, max: 10 },
  subtraction: { min: 1, max: 10 },
  counting: { min: 3, max: 10 },
  next: { min: 1, max: 20 },
  previous: { min: 1, max: 20 },
  comparison: { min: 1, max: 20 },
  pattern: { min: 1, max: 20, step: 1 },
  oddOneOut: { min: 10, max: 25 },
};

// Helper to create test attempts
function createAttempt(correct: boolean, timeMs: number): ProblemAttempt {
  return {
    correct,
    timeMs,
    problemType: 'addition',
    timestamp: Date.now(),
  };
}

// Helper to create multiple attempts
function createAttempts(count: number, correct: boolean, timeMs: number): ProblemAttempt[] {
  return Array(count).fill(null).map(() => createAttempt(correct, timeMs));
}

describe('difficultyEngine', () => {
  describe('calculateDifficulty', () => {
    test('maintains difficulty with insufficient data (<8 attempts)', () => {
      const history: PerformanceHistory = {
        attempts: createAttempts(2, true, 3000),
        successRate: 100,
        averageTimeMs: 3000,
      };

      const result = calculateDifficulty(history, defaultDifficulty);
      expect(result).toEqual(defaultDifficulty);
    });

    test('maintains difficulty with moderate performance (40-90%)', () => {
      const attempts: ProblemAttempt[] = [
        ...createAttempts(6, true, 5000),
        ...createAttempts(4, false, 5000),
      ];
      
      const history: PerformanceHistory = {
        attempts,
        successRate: 60,
        averageTimeMs: 5000,
      };

      const result = calculateDifficulty(history, defaultDifficulty);
      expect(result).toEqual(defaultDifficulty);
    });

    test('increases difficulty with high success rate (>=90%) and fast times', () => {
      const history: PerformanceHistory = {
        attempts: createAttempts(10, true, 3000),
        successRate: 100,
        averageTimeMs: 3000,
      };

      const result = calculateDifficulty(history, defaultDifficulty);
      
      // All ranges should increase
      expect(result.addition.max).toBeGreaterThan(defaultDifficulty.addition.max);
      expect(result.subtraction.max).toBeGreaterThan(defaultDifficulty.subtraction.max);
      expect(result.counting.max).toBeGreaterThan(defaultDifficulty.counting.max);
      expect(result.next.max).toBeGreaterThan(defaultDifficulty.next.max);
      expect(result.pattern.max).toBeGreaterThan(defaultDifficulty.pattern.max);
    });

    test('does not increase difficulty if success rate is high but times are slow', () => {
      const history: PerformanceHistory = {
        attempts: createAttempts(10, true, 20000),
        successRate: 100,
        averageTimeMs: 20000,
      };

      const result = calculateDifficulty(history, defaultDifficulty);
      expect(result).toEqual(defaultDifficulty);
    });

    test('decreases difficulty with low success rate (<40%)', () => {
      const attempts: ProblemAttempt[] = [
        ...createAttempts(3, true, 8000),
        ...createAttempts(7, false, 8000),
      ];
      
      const history: PerformanceHistory = {
        attempts,
        successRate: 30,
        averageTimeMs: 8000,
      };

      const result = calculateDifficulty(history, defaultDifficulty);
      
      // All ranges should decrease
      expect(result.addition.max).toBeLessThan(defaultDifficulty.addition.max);
      expect(result.subtraction.max).toBeLessThan(defaultDifficulty.subtraction.max);
      expect(result.counting.max).toBeLessThan(defaultDifficulty.counting.max);
      expect(result.next.max).toBeLessThan(defaultDifficulty.next.max);
      expect(result.pattern.max).toBeLessThan(defaultDifficulty.pattern.max);
    });

    test('respects minimum bounds when decreasing', () => {
      const lowDifficulty: Difficulty = {
        addition: { min: 1, max: 3 },
        subtraction: { min: 1, max: 3 },
        counting: { min: 3, max: 5 },
        next: { min: 1, max: 5 },
        previous: { min: 1, max: 5 },
        comparison: { min: 1, max: 5 },
        pattern: { min: 1, max: 5, step: 1 },
        oddOneOut: { min: 10, max: 15 },
      };

      const history: PerformanceHistory = {
        attempts: createAttempts(10, false, 8000),
        successRate: 0,
        averageTimeMs: 8000,
      };

      const result = calculateDifficulty(history, lowDifficulty);
      
      // Should not go below minimums
      expect(result.addition.min).toBeGreaterThanOrEqual(1);
      expect(result.counting.min).toBeGreaterThanOrEqual(3);
      expect(result.oddOneOut.min).toBeGreaterThanOrEqual(10);
    });

    test('respects maximum bounds when increasing', () => {
      const highDifficulty: Difficulty = {
        addition: { min: 45, max: 98 },
        subtraction: { min: 45, max: 98 },
        counting: { min: 15, max: 19 },
        next: { min: 45, max: 98 },
        previous: { min: 45, max: 98 },
        comparison: { min: 45, max: 98 },
        pattern: { min: 40, max: 49, step: 1 },
        oddOneOut: { min: 90, max: 98 },
      };

      const history: PerformanceHistory = {
        attempts: createAttempts(10, true, 3000),
        successRate: 100,
        averageTimeMs: 3000,
      };

      const result = calculateDifficulty(history, highDifficulty);
      
      // Should not go above maximums
      expect(result.addition.max).toBeLessThanOrEqual(100);
      expect(result.counting.max).toBeLessThanOrEqual(20);
      expect(result.pattern.max).toBeLessThanOrEqual(50);
      expect(result.oddOneOut.max).toBeLessThanOrEqual(100);
    });

    test('makes gentle adjustments (+2 on increase)', () => {
      const history: PerformanceHistory = {
        attempts: createAttempts(10, true, 3000),
        successRate: 100,
        averageTimeMs: 3000,
      };

      const result = calculateDifficulty(history, defaultDifficulty);
      
      // Check gentle increase (should be +2 for most)
      expect(result.addition.max - defaultDifficulty.addition.max).toBe(2);
      expect(result.subtraction.max - defaultDifficulty.subtraction.max).toBe(2);
    });

    test('makes larger decrease (-3) than increase for failing students', () => {
      const history: PerformanceHistory = {
        attempts: createAttempts(10, false, 8000),
        successRate: 0,
        averageTimeMs: 8000,
      };

      const result = calculateDifficulty(history, defaultDifficulty);
      
      // Decrease should be larger than increase
      const decrease = defaultDifficulty.addition.max - result.addition.max;
      expect(decrease).toBe(3); // Should be -3
    });
  });

  describe('shouldCelebrate', () => {
    test('returns false with insufficient attempts', () => {
      const history: PerformanceHistory = {
        attempts: createAttempts(2, true, 3000),
        successRate: 100,
        averageTimeMs: 3000,
      };

      expect(shouldCelebrate(history)).toBe(false);
    });

    test('returns true with 3 recent correct and fast answers', () => {
      const history: PerformanceHistory = {
        attempts: [
          createAttempt(false, 10000), // Earlier attempt - ignored
          createAttempt(true, 4000),
          createAttempt(true, 5000),
          createAttempt(true, 3000),
        ],
        successRate: 75,
        averageTimeMs: 5500,
      };

      expect(shouldCelebrate(history)).toBe(true);
    });

    test('returns false if any of last 3 are incorrect', () => {
      const history: PerformanceHistory = {
        attempts: [
          createAttempt(true, 3000),
          createAttempt(true, 3000),
          createAttempt(false, 3000), // One wrong
          createAttempt(true, 3000),
        ],
        successRate: 75,
        averageTimeMs: 3000,
      };

      expect(shouldCelebrate(history)).toBe(false);
    });

    test('returns false if last 3 are correct but too slow', () => {
      const history: PerformanceHistory = {
        attempts: createAttempts(3, true, 8000),
        successRate: 100,
        averageTimeMs: 8000,
      };

      expect(shouldCelebrate(history)).toBe(false);
    });

    test('threshold for fast is under 6 seconds average', () => {
      // Just under threshold
      const fastHistory: PerformanceHistory = {
        attempts: createAttempts(3, true, 5900),
        successRate: 100,
        averageTimeMs: 5900,
      };

      expect(shouldCelebrate(fastHistory)).toBe(true);

      // Just over threshold
      const slowHistory: PerformanceHistory = {
        attempts: createAttempts(3, true, 6100),
        successRate: 100,
        averageTimeMs: 6100,
      };

      expect(shouldCelebrate(slowHistory)).toBe(false);
    });
  });
});
