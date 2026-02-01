import type { Difficulty, PerformanceHistory } from '@/types';

/**
 * Adaptive Difficulty Engine
 * 
 * Adjusts difficulty based on the last 10 problems (lookbehind algorithm).
 * Key principle: Difficulty should increase very slowly and only when child is mastering.
 * 
 * Algorithm:
 * - Success rate >= 90% (9/10) AND reasonably fast → increase difficulty slightly
 * - Success rate < 40% → decrease difficulty
 * - Otherwise → maintain current difficulty
 * 
 * @param history - Performance history with last 10 attempts
 * @param currentDifficulty - Current difficulty settings
 * @returns Updated difficulty settings
 */
export function calculateDifficulty(
  history: PerformanceHistory,
  currentDifficulty: Difficulty
): Difficulty {
  // Need at least 8 attempts to get reliable data
  if (history.attempts.length < 8) {
    return currentDifficulty;
  }

  const { successRate, averageTimeMs } = history;

  // Define "reasonably fast": under 15 seconds for ages 5-8 (generous)
  const isReasonablyFast = averageTimeMs < 15000;

  // Determine adjustment direction
  let adjustment: 'increase' | 'decrease' | 'maintain';

  // Only increase if almost perfect AND not too slow
  if (successRate >= 90 && isReasonablyFast) {
    adjustment = 'increase';
  } else if (successRate < 40) {
    adjustment = 'decrease';
  } else {
    adjustment = 'maintain';
  }

  // No change needed
  if (adjustment === 'maintain') {
    return currentDifficulty;
  }

  // Helper to adjust a range - MUCH gentler steps
  const adjustRange = (
    current: { min: number; max: number },
    type: 'increase' | 'decrease'
  ): { min: number; max: number } => {
    const step = type === 'increase' ? 2 : -3; // Small increase, larger decrease
    
    return {
      min: Math.max(1, current.min + step),
      max: Math.min(100, current.max + step),
    };
  };

  // Apply adjustment to all problem types (gentle changes)
  return {
    addition: adjustRange(currentDifficulty.addition, adjustment),
    subtraction: adjustRange(currentDifficulty.subtraction, adjustment),
    counting: {
      min: Math.max(3, currentDifficulty.counting.min + (adjustment === 'increase' ? 1 : -1)),
      max: Math.min(20, currentDifficulty.counting.max + (adjustment === 'increase' ? 2 : -2)),
    },
    next: adjustRange(currentDifficulty.next, adjustment),
    previous: adjustRange(currentDifficulty.previous, adjustment),
    comparison: adjustRange(currentDifficulty.comparison, adjustment),
    pattern: {
      min: Math.max(1, currentDifficulty.pattern.min + (adjustment === 'increase' ? 1 : -1)),
      max: Math.min(50, currentDifficulty.pattern.max + (adjustment === 'increase' ? 2 : -2)),
      step: currentDifficulty.pattern.step, // Keep step consistent for patterns
    },
  };
}

/**
 * Helper to determine if recent performance warrants celebration
 * Returns true if the last 3+ problems were correct AND fast
 * 
 * @param history - Performance history
 * @returns Whether to show party poppers
 */
export function shouldCelebrate(history: PerformanceHistory): boolean {
  const recentAttempts = history.attempts.slice(-3);
  
  // Need at least 3 recent attempts
  if (recentAttempts.length < 3) {
    return false;
  }

  // All 3 must be correct
  const allCorrect = recentAttempts.every((a) => a.correct);
  if (!allCorrect) {
    return false;
  }

  // Average time must be fast (under 6 seconds)
  const avgTime = recentAttempts.reduce((sum, a) => sum + a.timeMs, 0) / recentAttempts.length;
  const isFast = avgTime < 6000;

  return isFast;
}
