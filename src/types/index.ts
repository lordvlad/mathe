/**
 * Math problem types available in the game
 */
export type ProblemType =
  | 'addition'
  | 'subtraction'
  | 'counting'
  | 'next'
  | 'previous'
  | 'comparison'
  | 'pattern';

/**
 * Available companion animals
 */
export type CompanionAnimal =
  | 'rabbit'
  | 'bear'
  | 'fox'
  | 'dog'
  | 'cat'
  | 'panda'
  | 'koala'
  | 'lion';

/**
 * Difficulty ranges for each problem type
 */
export interface Difficulty {
  addition: { min: number; max: number };
  subtraction: { min: number; max: number };
  counting: { min: number; max: number };
  next: { min: number; max: number };
  previous: { min: number; max: number };
  comparison: { min: number; max: number };
  pattern: { min: number; max: number; step: number };
}

/**
 * A single math problem with multiple choice options
 */
export interface Problem {
  type: ProblemType;
  question: string;
  answer: number;
  options: number[];
  displayItems?: string[]; // For counting problems (array of emoji)
}

/**
 * Record of a single problem attempt
 */
export interface ProblemAttempt {
  correct: boolean;
  timeMs: number;
  problemType: ProblemType;
  timestamp: number;
}

/**
 * Performance history tracking (last 10 problems)
 */
export interface PerformanceHistory {
  attempts: ProblemAttempt[];
  successRate: number;
  averageTimeMs: number;
}

/**
 * Session goal with treat destination
 */
export interface SessionGoal {
  treat: string; // emoji like 🍦, 🍫, 🍬
  animal: CompanionAnimal;
  totalProblems: number;
}

/**
 * Current game state
 */
export interface GameState {
  selectedAnimal: CompanionAnimal | null;
  currentSession: SessionGoal | null;
  currentProblem: Problem | null;
  sessionProgress: number; // 0-10
  difficulty: Difficulty;
  performanceHistory: PerformanceHistory;
  isSessionActive: boolean;
}

/**
 * Emotion states for companion animal
 */
export type AnimalEmotion = 'happy' | 'celebrating' | 'encouraging';
