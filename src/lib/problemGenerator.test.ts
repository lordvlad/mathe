import { describe, test, expect } from 'bun:test';
import { generateProblem, getRandomProblemType } from './problemGenerator';
import type { Difficulty } from '@/types';

// Default difficulty for testing
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

describe('problemGenerator', () => {
  describe('generateProblem', () => {
    test('addition generates valid problem', () => {
      const problem = generateProblem('addition', defaultDifficulty);
      
      expect(problem.type).toBe('addition');
      expect(problem.question).toMatch(/^\d+ \+ \d+ = \?$/);
      expect(typeof problem.answer).toBe('number');
      expect(problem.options).toHaveLength(4);
      expect(problem.options).toContain(problem.answer);
    });

    test('subtraction generates valid problem with positive result', () => {
      const problem = generateProblem('subtraction', defaultDifficulty);
      
      expect(problem.type).toBe('subtraction');
      expect(problem.question).toMatch(/^\d+ - \d+ = \?$/);
      expect(typeof problem.answer).toBe('number');
      expect(problem.answer).toBeGreaterThanOrEqual(0); // No negative answers
      expect(problem.options).toHaveLength(4);
      expect(problem.options).toContain(problem.answer);
    });

    test('counting generates valid problem', () => {
      const problem = generateProblem('counting', defaultDifficulty);
      
      expect(problem.type).toBe('counting');
      expect(problem.question).toBe('Wie viele siehst du?');
      expect(typeof problem.answer).toBe('number');
      expect(problem.answer).toBeGreaterThanOrEqual(defaultDifficulty.counting.min);
      expect(problem.answer).toBeLessThanOrEqual(defaultDifficulty.counting.max);
      expect(problem.displayItems).toHaveLength(problem.answer);
      expect(problem.options).toHaveLength(4);
    });

    test('next generates valid problem', () => {
      const problem = generateProblem('next', defaultDifficulty);
      
      expect(problem.type).toBe('next');
      expect(problem.question).toMatch(/^Was kommt nach \d+\?$/);
      expect(typeof problem.answer).toBe('number');
      expect(problem.options).toHaveLength(4);
      expect(problem.options).toContain(problem.answer);
      
      // Extract number from question and verify answer is next
      const match = problem.question.match(/\d+/);
      expect(match).not.toBeNull();
      if (match) {
        const num = parseInt(match[0]);
        expect(problem.answer).toBe(num + 1);
      }
    });

    test('previous generates valid problem', () => {
      const problem = generateProblem('previous', defaultDifficulty);
      
      expect(problem.type).toBe('previous');
      expect(problem.question).toMatch(/^Was kommt vor \d+\?$/);
      expect(typeof problem.answer).toBe('number');
      expect(problem.options).toHaveLength(4);
      expect(problem.options).toContain(problem.answer);
      
      // Extract number from question and verify answer is previous
      const match = problem.question.match(/\d+/);
      expect(match).not.toBeNull();
      if (match) {
        const num = parseInt(match[0]);
        expect(problem.answer).toBe(num - 1);
      }
    });

    test('comparison generates valid problem with different numbers', () => {
      const problem = generateProblem('comparison', defaultDifficulty);
      
      expect(problem.type).toBe('comparison');
      expect(problem.question).toMatch(/^Welche Zahl ist größer: \d+ oder \d+\?$/);
      expect(typeof problem.answer).toBe('number');
      expect(problem.options).toHaveLength(2);
      expect(problem.options).toContain(problem.answer);
      
      // Extract both numbers and verify answer is the larger one
      const matches = problem.question.match(/\d+/g);
      expect(matches).toHaveLength(2);
      if (matches && matches.length === 2) {
        const a = Number(matches[0]);
        const b = Number(matches[1]);
        expect(problem.answer).toBe(Math.max(a, b));
        expect(a).not.toBe(b); // Numbers should be different
      }
    });

    test('pattern generates valid problem', () => {
      const problem = generateProblem('pattern', defaultDifficulty);
      
      expect(problem.type).toBe('pattern');
      expect(problem.question).toMatch(/^\d+, \d+, \d+, \?/);
      expect(typeof problem.answer).toBe('number');
      expect(problem.options).toHaveLength(4);
      expect(problem.options).toContain(problem.answer);
    });

    test('oddOneOut generates valid problem at higher difficulty', () => {
      const highDifficulty: Difficulty = {
        ...defaultDifficulty,
        oddOneOut: { min: 25, max: 50 },
      };
      
      const problem = generateProblem('oddOneOut', highDifficulty);
      
      expect(problem.type).toBe('oddOneOut');
      expect(problem.question).toContain('Welche Zahl passt nicht');
      expect(typeof problem.answer).toBe('number');
      expect(problem.options).toHaveLength(5);
      expect(problem.options).toContain(problem.answer);
    });

    test('addition respects difficulty bounds', () => {
      const customDifficulty: Difficulty = {
        ...defaultDifficulty,
        addition: { min: 5, max: 15 },
      };
      
      // Generate multiple problems to test range
      for (let i = 0; i < 20; i++) {
        const problem = generateProblem('addition', customDifficulty);
        
        // Extract numbers from question
        const matches = problem.question.match(/\d+/g);
        expect(matches).toHaveLength(2);
        if (matches && matches.length === 2) {
          const a = Number(matches[0]);
          const b = Number(matches[1]);
          
          expect(a).toBeGreaterThanOrEqual(5);
          expect(a).toBeLessThanOrEqual(15);
          expect(b).toBeGreaterThanOrEqual(5);
          expect(b).toBeLessThanOrEqual(15);
        }
      }
    });

    test('all problem types have 4 options except comparison and oddOneOut', () => {
      const types = ['addition', 'subtraction', 'counting', 'next', 'previous', 'pattern'] as const;
      
      types.forEach(type => {
        const problem = generateProblem(type, defaultDifficulty);
        expect(problem.options).toHaveLength(4);
      });
      
      const comparison = generateProblem('comparison', defaultDifficulty);
      expect(comparison.options).toHaveLength(2);
      
      const oddOneOut = generateProblem('oddOneOut', {
        ...defaultDifficulty,
        oddOneOut: { min: 25, max: 50 },
      });
      expect(oddOneOut.options).toHaveLength(5);
    });

    test('options do not contain duplicates', () => {
      const types = ['addition', 'subtraction', 'counting', 'next', 'previous', 'pattern', 'comparison'] as const;
      
      types.forEach(type => {
        const problem = generateProblem(type, defaultDifficulty);
        const uniqueOptions = new Set(problem.options);
        expect(uniqueOptions.size).toBe(problem.options.length);
      });
    });
  });

  describe('getRandomProblemType', () => {
    test('returns valid problem type', () => {
      const validTypes = ['addition', 'subtraction', 'counting', 'next', 'previous', 'comparison', 'pattern'];
      
      const type = getRandomProblemType();
      expect(validTypes).toContain(type);
    });

    test('includes oddOneOut at higher difficulty', () => {
      const highDifficulty: Difficulty = {
        ...defaultDifficulty,
        oddOneOut: { min: 25, max: 50 },
      };
      
      // Generate many to check if oddOneOut appears
      const types = new Set<string>();
      for (let i = 0; i < 100; i++) {
        types.add(getRandomProblemType(highDifficulty));
      }
      
      expect(types.has('oddOneOut')).toBe(true);
    });

    test('excludes oddOneOut at lower difficulty', () => {
      const lowDifficulty: Difficulty = {
        ...defaultDifficulty,
        oddOneOut: { min: 10, max: 20 }, // max < 25
      };
      
      // Generate many to ensure oddOneOut never appears
      for (let i = 0; i < 100; i++) {
        const type = getRandomProblemType(lowDifficulty);
        expect(type).not.toBe('oddOneOut');
      }
    });

    test('returns different types over multiple calls', () => {
      const types = new Set<string>();
      
      for (let i = 0; i < 50; i++) {
        types.add(getRandomProblemType());
      }
      
      // Should have gotten at least 3 different types
      expect(types.size).toBeGreaterThanOrEqual(3);
    });
  });
});
