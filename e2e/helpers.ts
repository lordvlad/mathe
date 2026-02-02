import type { Page } from '@playwright/test';

/**
 * Helper to get the current problem from the game store
 * This allows us to click the correct answer reliably
 */
export async function getCurrentProblem(page: Page) {
  return await page.evaluate(() => {
    const storeKey = 'game-store';
    const storeData = localStorage.getItem(storeKey);
    if (!storeData) return null;
    
    const parsed = JSON.parse(storeData);
    return parsed.state?.currentProblem || null;
  });
}

/**
 * Helper to set initial game state in localStorage
 * Useful for testing specific scenarios
 */
export async function setGameState(page: Page, state: any) {
  await page.evaluate((stateData) => {
    const storeKey = 'game-store';
    const existingData = localStorage.getItem(storeKey);
    const existing = existingData ? JSON.parse(existingData) : {};
    
    const newData = {
      ...existing,
      state: {
        ...existing.state,
        ...stateData,
      },
    };
    
    localStorage.setItem(storeKey, JSON.stringify(newData));
  }, state);
}

/**
 * Helper to clear game state from localStorage
 */
export async function clearGameState(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('game-store');
  });
}

/**
 * Helper to click the correct answer for the current problem
 */
export async function clickCorrectAnswer(page: Page) {
  const problem = await getCurrentProblem(page);
  if (!problem) {
    throw new Error('No current problem found in game state');
  }
  
  const correctAnswer = problem.answer;
  
  // Find and click the button with the correct answer
  const correctButton = page.getByRole('button', { name: String(correctAnswer), exact: true });
  await correctButton.click();
}

/**
 * Helper to click an incorrect answer for the current problem
 */
export async function clickIncorrectAnswer(page: Page) {
  const problem = await getCurrentProblem(page);
  if (!problem) {
    throw new Error('No current problem found in game state');
  }
  
  const correctAnswer = problem.answer;
  const options = problem.options;
  
  // Find an incorrect option
  const incorrectOption = options.find((opt: number) => opt !== correctAnswer);
  if (incorrectOption === undefined) {
    throw new Error('No incorrect answer available');
  }
  
  // Click the incorrect button
  const incorrectButton = page.getByRole('button', { name: String(incorrectOption), exact: true });
  await incorrectButton.click();
}

/**
 * Helper to wait for problem to be ready
 */
export async function waitForProblem(page: Page, timeout = 10000) {
  // Wait for question to be visible
  await page.locator('text=/\\?|größer|viele|kommt|passt/').waitFor({ state: 'visible', timeout });
  
  // Wait a bit for the problem to be set in store
  await page.waitForTimeout(100);
  
  // Verify problem exists in store
  const problem = await getCurrentProblem(page);
  if (!problem) {
    throw new Error('Problem not found in store after waiting');
  }
  
  return problem;
}
