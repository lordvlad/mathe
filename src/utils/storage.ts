import type { CompanionAnimal, Difficulty } from '@/types';

/**
 * Safe wrapper around localStorage with error handling
 */

const STORAGE_KEYS = {
  ANIMAL: 'math-game-animal',
  DIFFICULTY: 'math-game-difficulty',
} as const;

/**
 * Generic localStorage getter with type safety
 */
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Generic localStorage setter with error handling
 */
function setItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Get stored companion animal
 */
export function getStoredAnimal(): CompanionAnimal | null {
  return getItem<CompanionAnimal | null>(STORAGE_KEYS.ANIMAL, null);
}

/**
 * Save companion animal
 */
export function saveAnimal(animal: CompanionAnimal): boolean {
  return setItem(STORAGE_KEYS.ANIMAL, animal);
}

/**
 * Get stored difficulty settings
 */
export function getDifficulty(): Difficulty | null {
  return getItem<Difficulty | null>(STORAGE_KEYS.DIFFICULTY, null);
}

/**
 * Save difficulty settings
 */
export function saveDifficulty(difficulty: Difficulty): boolean {
  return setItem(STORAGE_KEYS.DIFFICULTY, difficulty);
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
