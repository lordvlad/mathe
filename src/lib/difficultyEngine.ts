import type { Difficulty, PerformanceHistory } from '@/types';

/**
 * Adaptive Difficulty Engine
 * 
 * Adjusts difficulty based on the last 10 problems (lookbehind algorithm).
 * Key principle: One wrong answer in 10 correct should NOT drop difficulty.
 * 
 * Algorithm:
 * - Success rate > 80% AND fast responses → increase difficulty
 * - Success rate < 50% → decrease difficulty
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
  // Not enough data to adjust yet (need at least 5 attempts)
  if (history.attempts.length < 5) {
    return currentDifficulty;
  }

  const { successRate, averageTimeMs } = history;

  // Define "fast" response: under 8 seconds for ages 5-8
  const isFast = averageTimeMs < 8000;

  // Determine adjustment direction
  let adjustment: 'increase' | 'decrease' | 'maintain';

  if (successRate > 80 && isFast) {
    adjustment = 'increase';
  } else if (successRate < 50) {
    adjustment = 'decrease';
  } else {
    adjustment = 'maintain';
  }

  // No change needed
  if (adjustment === 'maintain') {
    return currentDifficulty;
  }

  // Helper to adjust a range
  const adjustRange = (
    current: { min: number; max: number },
    type: 'increase' | 'decrease'
  ): { min: number; max: number } => {
    const step = type === 'increase' ? 5 : -3; // Increase faster, decrease slower
    
    return {
      min: Math.max(1, current.min + step),
      max: Math.min(100, current.max + step),
    };
  };

  // Apply adjustment to all problem types
  return {
    addition: adjustRange(currentDifficulty.addition, adjustment),
    subtraction: adjustRange(currentDifficulty.subtraction, adjustment),
    counting: {
      min: Math.max(3, currentDifficulty.counting.min + (adjustment === 'increase' ? 2 : -1)),
      max: Math.min(20, currentDifficulty.counting.max + (adjustment === 'increase' ? 3 : -2)),
    },
    next: adjustRange(currentDifficulty.next, adjustment),
    previous: adjustRange(currentDifficulty.previous, adjustment),
    comparison: adjustRange(currentDifficulty.comparison, adjustment),
    pattern: {
      min: Math.max(1, currentDifficulty.pattern.min + (adjustment === 'increase' ? 2 : -1)),
      max: Math.min(50, currentDifficulty.pattern.max + (adjustment === 'increase' ? 5 : -2)),
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
