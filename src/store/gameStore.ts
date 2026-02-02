import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CompanionAnimal,
  Difficulty,
  GameState,
  PerformanceHistory,
  Problem,
  ProblemAttempt,
  SessionGoal,
} from '@/types';

/**
 * Initial difficulty levels for a new player (ages 5-8)
 */
const INITIAL_DIFFICULTY: Difficulty = {
  addition: { min: 1, max: 10 },
  subtraction: { min: 1, max: 10 },
  counting: { min: 3, max: 10 },
  next: { min: 1, max: 20 },
  previous: { min: 1, max: 20 },
  comparison: { min: 1, max: 20 },
  pattern: { min: 1, max: 10, step: 1 },
  oddOneOut: { min: 10, max: 30 },
};

/**
 * Initial empty performance history
 */
const INITIAL_HISTORY: PerformanceHistory = {
  attempts: [],
  successRate: 0,
  averageTimeMs: 0,
};

interface GameActions {
  selectAnimal: (animal: CompanionAnimal) => void;
  startSession: (goal: SessionGoal) => void;
  setCurrentProblem: (problem: Problem) => void;
  submitAnswer: (correct: boolean, timeMs: number, problemType: Problem['type']) => void;
  nextProblem: () => void;
  resetSession: () => void;
  updateDifficulty: (newDifficulty: Difficulty) => void;
}

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial State
      selectedAnimal: null,
      currentSession: null,
      currentProblem: null,
      sessionProgress: 0,
      difficulty: INITIAL_DIFFICULTY,
      performanceHistory: INITIAL_HISTORY,
      isSessionActive: false,

      // Actions
      selectAnimal: (animal) => {
        set({ selectedAnimal: animal });
      },

      startSession: (goal) => {
        set({
          currentSession: goal,
          sessionProgress: 0,
          isSessionActive: true,
          currentProblem: null,
        });
      },

      setCurrentProblem: (problem) => {
        set({ currentProblem: problem });
      },

      submitAnswer: (correct, timeMs, problemType) => {
        const { performanceHistory } = get();
        
        // Create new attempt record
        const newAttempt: ProblemAttempt = {
          correct,
          timeMs,
          problemType,
          timestamp: Date.now(),
        };

        // Keep only last 10 attempts
        const updatedAttempts = [...performanceHistory.attempts, newAttempt].slice(-10);

        // Calculate new stats
        const successCount = updatedAttempts.filter((a) => a.correct).length;
        const successRate = updatedAttempts.length > 0
          ? (successCount / updatedAttempts.length) * 100
          : 0;
        
        const averageTimeMs = updatedAttempts.length > 0
          ? updatedAttempts.reduce((sum, a) => sum + a.timeMs, 0) / updatedAttempts.length
          : 0;

        set({
          performanceHistory: {
            attempts: updatedAttempts,
            successRate,
            averageTimeMs,
          },
        });
      },

      nextProblem: () => {
        const { sessionProgress, currentSession } = get();
        if (!currentSession) return;

        const newProgress = sessionProgress + 1;

        // Check if session is complete
        if (newProgress >= currentSession.totalProblems) {
          set({
            sessionProgress: newProgress,
            isSessionActive: false,
            currentProblem: null,
          });
        } else {
          set({
            sessionProgress: newProgress,
            currentProblem: null, // Will be set by game manager
          });
        }
      },

      resetSession: () => {
        set({
          currentSession: null,
          currentProblem: null,
          sessionProgress: 0,
          isSessionActive: false,
        });
      },

      updateDifficulty: (newDifficulty) => {
        set({ difficulty: newDifficulty });
      },
    }),
    {
      name: 'math-game-state',
      // Only persist these fields
      partialize: (state) => ({
        selectedAnimal: state.selectedAnimal,
        difficulty: state.difficulty,
        performanceHistory: state.performanceHistory,
      }),
      // Migrate old saved states to add new problem types
      migrate: (persistedState: any, version: number) => {
        // Add oddOneOut difficulty if it doesn't exist (for backwards compatibility)
        if (persistedState.difficulty && !persistedState.difficulty.oddOneOut) {
          persistedState.difficulty.oddOneOut = { min: 10, max: 30 };
        }
        return persistedState;
      },
      version: 1,
    }
  )
);
