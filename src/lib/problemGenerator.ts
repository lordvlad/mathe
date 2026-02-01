import type { Difficulty, Problem, ProblemType } from '@/types';

/**
 * Generate a random number within a range (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

/**
 * Generate plausible distractors for multiple choice
 */
function generateDistractors(correct: number, count: number = 3): number[] {
  const distractors = new Set<number>();
  
  while (distractors.size < count) {
    const offset = randomInt(-5, 5);
    const distractor = Math.max(0, correct + offset);
    
    // Don't add the correct answer or duplicates
    if (distractor !== correct) {
      distractors.add(distractor);
    }
  }
  
  return Array.from(distractors);
}

/**
 * Generate addition problem
 */
function generateAddition(difficulty: Difficulty['addition']): Problem {
  const a = randomInt(difficulty.min, difficulty.max);
  const b = randomInt(difficulty.min, difficulty.max);
  const answer = a + b;
  
  const distractors = generateDistractors(answer);
  const options = shuffle([answer, ...distractors]);
  
  return {
    type: 'addition',
    question: `${a} + ${b} = ?`,
    answer,
    options,
  };
}

/**
 * Generate subtraction problem (ensure positive results)
 */
function generateSubtraction(difficulty: Difficulty['subtraction']): Problem {
  const a = randomInt(difficulty.min, difficulty.max);
  const b = randomInt(difficulty.min, Math.min(a, difficulty.max)); // Ensure b <= a
  const answer = a - b;
  
  const distractors = generateDistractors(answer);
  const options = shuffle([answer, ...distractors]);
  
  return {
    type: 'subtraction',
    question: `${a} - ${b} = ?`,
    answer,
    options,
  };
}

/**
 * Generate counting problem
 */
function generateCounting(difficulty: Difficulty['counting']): Problem {
  const count = randomInt(difficulty.min, difficulty.max);
  
  // Use various emoji for counting
  const countEmoji = ['🌟', '⭐', '🎈', '🎨', '🎯', '🏀', '⚽', '🎪'];
  const emoji = countEmoji[randomInt(0, countEmoji.length - 1)]!;
  
  const displayItems = Array(count).fill(emoji);
  
  const distractors = generateDistractors(count);
  const options = shuffle([count, ...distractors]);
  
  return {
    type: 'counting',
    question: 'Wie viele siehst du?',
    answer: count,
    options,
    displayItems,
  };
}

/**
 * Generate "next number" problem
 */
function generateNext(difficulty: Difficulty['next']): Problem {
  const number = randomInt(difficulty.min, difficulty.max - 1);
  const answer = number + 1;
  
  const distractors = generateDistractors(answer);
  const options = shuffle([answer, ...distractors]);
  
  return {
    type: 'next',
    question: `Was kommt nach ${number}?`,
    answer,
    options,
  };
}

/**
 * Generate "previous number" problem
 */
function generatePrevious(difficulty: Difficulty['previous']): Problem {
  const number = randomInt(difficulty.min + 1, difficulty.max);
  const answer = number - 1;
  
  const distractors = generateDistractors(answer);
  const options = shuffle([answer, ...distractors]);
  
  return {
    type: 'previous',
    question: `Was kommt vor ${number}?`,
    answer,
    options,
  };
}

/**
 * Generate comparison problem
 */
function generateComparison(difficulty: Difficulty['comparison']): Problem {
  const a = randomInt(difficulty.min, difficulty.max);
  const b = randomInt(difficulty.min, difficulty.max);
  
  // Avoid equal numbers - only ask "which is bigger"
  if (a === b) {
    // Regenerate b to ensure they're different
    const newB = a + (Math.random() < 0.5 ? -1 : 1);
    const bFinal = Math.max(difficulty.min, Math.min(difficulty.max, newB));
    
    const answer = a > bFinal ? a : bFinal;
    const question = `Welche Zahl ist größer: ${a} oder ${bFinal}?`;
    const options = shuffle([a, bFinal]);
    
    return {
      type: 'comparison',
      question,
      answer,
      options,
    };
  }
  
  const answer = a > b ? a : b;
  const question = `Welche Zahl ist größer: ${a} oder ${b}?`;
  const options = shuffle([a, b]);
  
  return {
    type: 'comparison',
    question,
    answer,
    options,
  };
}

/**
 * Generate pattern problem
 */
function generatePattern(difficulty: Difficulty['pattern']): Problem {
  const start = randomInt(difficulty.min, difficulty.max);
  const step = difficulty.step;
  
  // Generate a simple arithmetic sequence
  const sequence = [start, start + step, start + step * 2];
  const answer = start + step * 3;
  
  const question = `${sequence.join(', ')}, ?`;
  
  const distractors = generateDistractors(answer);
  const options = shuffle([answer, ...distractors]);
  
  return {
    type: 'pattern',
    question,
    answer,
    options,
  };
}

/**
 * Main problem generator
 * Generates a math problem based on type and difficulty
 * 
 * @param type - Type of problem to generate
 * @param difficulty - Current difficulty settings
 * @returns A Problem object with question, answer, and options
 */
export function generateProblem(type: ProblemType, difficulty: Difficulty): Problem {
  switch (type) {
    case 'addition':
      return generateAddition(difficulty.addition);
    case 'subtraction':
      return generateSubtraction(difficulty.subtraction);
    case 'counting':
      return generateCounting(difficulty.counting);
    case 'next':
      return generateNext(difficulty.next);
    case 'previous':
      return generatePrevious(difficulty.previous);
    case 'comparison':
      return generateComparison(difficulty.comparison);
    case 'pattern':
      return generatePattern(difficulty.pattern);
    default:
      throw new Error(`Unknown problem type: ${type}`);
  }
}

/**
 * Get a random problem type
 */
export function getRandomProblemType(): ProblemType {
  const types: ProblemType[] = [
    'addition',
    'subtraction',
    'counting',
    'next',
    'previous',
    'comparison',
    'pattern',
  ];
  
  return types[randomInt(0, types.length - 1)]!;
}
