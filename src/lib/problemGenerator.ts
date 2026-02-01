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
 * At higher difficulties, uses skip counting (every 2nd, 3rd, 5th number)
 * At very high difficulties, includes alternating patterns
 */
function generatePattern(difficulty: Difficulty['pattern']): Problem {
  const start = randomInt(difficulty.min, difficulty.max);
  
  // Determine pattern type based on difficulty level
  let sequence: number[];
  let answer: number;
  let patternDescription: string = '';
  
  if (difficulty.max >= 40) {
    // Very advanced: alternating patterns (e.g., +2, +3, +2, +3...)
    const useAlternating = Math.random() < 0.3; // 30% chance
    
    if (useAlternating) {
      const step1 = randomInt(1, 3);
      const step2 = randomInt(1, 3);
      sequence = [
        start,
        start + step1,
        start + step1 + step2,
      ];
      answer = start + step1 + step2 + step1;
      patternDescription = ` (+${step1}, +${step2}, +${step1}, ?)`;
    } else {
      // Skip counting by 3 or 5
      const step = Math.random() < 0.5 ? 3 : 5;
      sequence = [start, start + step, start + step * 2];
      answer = start + step * 3;
      patternDescription = ` (Immer +${step})`;
    }
  } else if (difficulty.max >= 30) {
    // Advanced: skip counting by 2, 3, or 5
    const steps = [2, 3, 5];
    const step = steps[randomInt(0, steps.length - 1)]!;
    sequence = [start, start + step, start + step * 2];
    answer = start + step * 3;
    patternDescription = ` (Immer +${step})`;
  } else if (difficulty.max >= 20) {
    // Intermediate: skip counting by 2, or countdown
    const useCountdown = Math.random() < 0.2; // 20% chance for countdown
    
    if (useCountdown && start >= 6) {
      const step = -2;
      sequence = [start, start + step, start + step * 2];
      answer = start + step * 3;
      patternDescription = ' (Immer -2)';
    } else {
      const step = Math.random() < 0.5 ? 1 : 2;
      sequence = [start, start + step, start + step * 2];
      answer = start + step * 3;
      patternDescription = step === 2 ? ' (Immer +2)' : '';
    }
  } else {
    // Beginner: simple +1 counting
    const step = 1;
    sequence = [start, start + step, start + step * 2];
    answer = start + step * 3;
  }
  
  const question = `${sequence.join(', ')}, ?${patternDescription}`;
  
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
 * Generate "odd one out" problem
 * Find the number that doesn't fit the pattern
 * Only available at higher difficulties (max >= 25)
 */
function generateOddOneOut(difficulty: Difficulty['oddOneOut']): Problem {
  // Different pattern types based on difficulty
  let numbers: number[];
  let oddOne: number;
  let hint: string;
  
  if (difficulty.max >= 50) {
    // Very advanced: divisibility patterns
    const divisor = [2, 3, 5][randomInt(0, 2)]!;
    const base = randomInt(10, 30);
    
    // Generate 4 numbers divisible by divisor, 1 that isn't
    numbers = [
      base * divisor,
      (base + 1) * divisor,
      (base + 2) * divisor,
      (base + 3) * divisor,
      (base * divisor) + 1, // The odd one
    ];
    oddOne = numbers[4]!;
    hint = ` (Welche Zahl passt nicht?)`;
  } else if (difficulty.max >= 35) {
    // Advanced: tens/ones digit patterns
    const useOnesDigit = Math.random() < 0.5;
    
    if (useOnesDigit) {
      // All end with same digit except one
      const digit = randomInt(1, 9);
      const base = randomInt(10, 40);
      
      numbers = [
        base + digit,
        base + 10 + digit,
        base + 20 + digit,
        base + 30 + digit,
        base + 15 + ((digit + 3) % 10), // Different ending
      ];
      oddOne = numbers[4]!;
      hint = ` (Alle enden mit ${digit}, außer...)`;
    } else {
      // All in same tens range except one
      const tens = randomInt(2, 5) * 10;
      numbers = [
        tens + randomInt(1, 9),
        tens + randomInt(1, 9),
        tens + randomInt(1, 9),
        tens + randomInt(1, 9),
        tens + 20 + randomInt(1, 9), // Different tens
      ];
      oddOne = numbers[4]!;
      hint = ` (Welche Zahl passt nicht?)`;
    }
  } else {
    // Beginner: simple ending digit pattern
    const digit = randomInt(0, 9);
    const base = randomInt(10, 25);
    
    numbers = [
      base + digit,
      base + 10 + digit,
      base + 20 + digit,
      base + 30 + digit,
      base + 15 + ((digit + 4) % 10), // Different ending
    ];
    oddOne = numbers[4]!;
    hint = ` (Welche passt nicht?)`;
  }
  
  // Shuffle the numbers
  const shuffled = shuffle([...numbers]);
  
  const question = `${shuffled.join(', ')}${hint}`;
  const options = shuffled;
  
  return {
    type: 'oddOneOut',
    question,
    answer: oddOne,
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
    case 'oddOneOut':
      return generateOddOneOut(difficulty.oddOneOut);
    default:
      throw new Error(`Unknown problem type: ${type}`);
  }
}

/**
 * Get a random problem type
 * Only includes oddOneOut at higher difficulties (max >= 25)
 */
export function getRandomProblemType(difficulty?: Difficulty): ProblemType {
  const types: ProblemType[] = [
    'addition',
    'subtraction',
    'counting',
    'next',
    'previous',
    'comparison',
    'pattern',
  ];
  
  // Add oddOneOut only at higher difficulties
  if (difficulty && difficulty.oddOneOut.max >= 25) {
    types.push('oddOneOut');
  }
  
  return types[randomInt(0, types.length - 1)]!;
}
