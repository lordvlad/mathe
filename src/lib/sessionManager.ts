import type { CompanionAnimal, Problem, SessionGoal } from '@/types';
import { getRandomProblemType } from './problemGenerator';

/**
 * Create a new session with randomized treat goal
 * 
 * @param animal - The companion animal for this session
 * @returns Session goal with treat and problem sequence
 */
export function createSession(animal: CompanionAnimal): SessionGoal {
  const treats = ['🍦', '🍫', '🍬', '🍭', '🍩', '🍪', '🧁', '🎂'];
  const randomTreat = treats[Math.floor(Math.random() * treats.length)]!;
  
  return {
    treat: randomTreat,
    animal,
    totalProblems: 10, // Hardcoded for v1
  };
}

/**
 * Generate a mixed sequence of 10 problems
 * Ensures variety by not repeating the same type consecutively
 * 
 * @returns Array of 10 problem types
 */
export function generateProblemSequence(): Problem['type'][] {
  const sequence: Problem['type'][] = [];
  let lastType: Problem['type'] | null = null;
  
  for (let i = 0; i < 10; i++) {
    let nextType = getRandomProblemType();
    
    // Avoid consecutive repeats
    while (nextType === lastType && i > 0) {
      nextType = getRandomProblemType();
    }
    
    sequence.push(nextType);
    lastType = nextType;
  }
  
  return sequence;
}

/**
 * Check if an answer is correct
 * 
 * @param userAnswer - The user's selected answer
 * @param correctAnswer - The correct answer
 * @returns Whether the answer is correct
 */
export function checkAnswer(userAnswer: number, correctAnswer: number): boolean {
  return userAnswer === correctAnswer;
}
