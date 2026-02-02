import { describe, test, expect } from 'bun:test';
import { createSession, generateProblemSequence, checkAnswer } from './sessionManager';
import type { CompanionAnimal } from '@/types';

describe('sessionManager', () => {
  describe('createSession', () => {
    test('creates session with provided animal', () => {
      const animal: CompanionAnimal = 'rabbit';
      const session = createSession(animal);
      
      expect(session.animal).toBe('rabbit');
      expect(session.totalProblems).toBe(10);
      expect(typeof session.treat).toBe('string');
    });

    test('assigns a valid treat emoji', () => {
      const validTreats = ['🍦', '🍫', '🍬', '🍭', '🍩', '🍪', '🧁', '🎂'];
      const session = createSession('dog');
      
      expect(validTreats).toContain(session.treat);
    });

    test('creates different treats across multiple sessions (randomness)', () => {
      const treats = new Set<string>();
      
      // Create 20 sessions to test randomness
      for (let i = 0; i < 20; i++) {
        const session = createSession('cat');
        treats.add(session.treat);
      }
      
      // Should get at least 2 different treats in 20 attempts
      expect(treats.size).toBeGreaterThanOrEqual(2);
    });

    test('works with all animal types', () => {
      const animals: CompanionAnimal[] = [
        'rabbit', 'bear', 'fox', 'dog', 'cat', 'panda', 'koala', 'lion'
      ];
      
      animals.forEach(animal => {
        const session = createSession(animal);
        expect(session.animal).toBe(animal);
        expect(session.totalProblems).toBe(10);
      });
    });
  });

  describe('generateProblemSequence', () => {
    test('generates exactly 10 problems', () => {
      const sequence = generateProblemSequence();
      expect(sequence).toHaveLength(10);
    });

    test('includes valid problem types', () => {
      const validTypes = [
        'addition', 'subtraction', 'counting', 'next', 'previous', 'comparison', 'pattern', 'oddOneOut'
      ];
      
      const sequence = generateProblemSequence();
      
      sequence.forEach(type => {
        expect(validTypes).toContain(type);
      });
    });

    test('avoids consecutive repeats', () => {
      // Generate multiple sequences to test the constraint
      for (let i = 0; i < 10; i++) {
        const sequence = generateProblemSequence();
        
        // Check for consecutive duplicates
        for (let j = 1; j < sequence.length; j++) {
          expect(sequence[j]).not.toBe(sequence[j - 1]);
        }
      }
    });

    test('provides variety across problem types', () => {
      const sequence = generateProblemSequence();
      const uniqueTypes = new Set(sequence);
      
      // Should have at least 3 different types in 10 problems
      expect(uniqueTypes.size).toBeGreaterThanOrEqual(3);
    });

    test('generates different sequences (randomness)', () => {
      const sequence1 = generateProblemSequence();
      const sequence2 = generateProblemSequence();
      
      // Should not be identical (very low probability)
      const identical = sequence1.every((type, i) => type === sequence2[i]);
      expect(identical).toBe(false);
    });
  });

  describe('checkAnswer', () => {
    test('returns true for correct answer', () => {
      expect(checkAnswer(5, 5)).toBe(true);
      expect(checkAnswer(0, 0)).toBe(true);
      expect(checkAnswer(100, 100)).toBe(true);
    });

    test('returns false for incorrect answer', () => {
      expect(checkAnswer(5, 3)).toBe(false);
      expect(checkAnswer(0, 1)).toBe(false);
      expect(checkAnswer(100, 99)).toBe(false);
    });

    test('handles edge cases', () => {
      // Very large numbers
      expect(checkAnswer(999999, 999999)).toBe(true);
      expect(checkAnswer(999999, 999998)).toBe(false);
      
      // Negative numbers (shouldn't occur in game, but test anyway)
      expect(checkAnswer(-5, -5)).toBe(true);
      expect(checkAnswer(-5, 5)).toBe(false);
    });

    test('is type-strict (number comparison)', () => {
      // Both must be numbers
      expect(checkAnswer(5, 5)).toBe(true);
      
      // Off by one
      expect(checkAnswer(5, 6)).toBe(false);
      expect(checkAnswer(6, 5)).toBe(false);
    });
  });
});
