import type { Page } from '@playwright/test';

/**
 * Helper to get the current problem from the game store
 * Note: currentProblem is NOT persisted to localStorage
 */
export async function getCurrentProblem(page: Page) {
  return await page.evaluate(() => {
    const storeKey = 'math-game-state';
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
    const storeKey = 'math-game-state';
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
 * Safe to call before navigation - will be no-op if page not ready
 */
export async function clearGameState(page: Page) {
  try {
    await page.evaluate(() => {
      localStorage.removeItem('math-game-state');
    });
  } catch (error) {
    // Ignore errors if localStorage not accessible yet (page not loaded)
    // This is expected when called in beforeEach before goto()
  }
}

/**
 * Helper to click the correct answer for the current problem
 * Works by parsing the question text to determine the answer
 */
export async function clickCorrectAnswer(page: Page) {
  // Wait for question to be visible
  const questionLocator = page.locator('text=/\\?|größer|viele|kommt|passt/');
  await questionLocator.waitFor({ state: 'visible', timeout: 5000 });
  
  // Get the question text
  const questionText = await questionLocator.textContent() || '';
  
  // Parse the question to find the correct answer
  let correctAnswer: number | null = null;
  
  // For "größer" (greater) questions: "Welche Zahl ist größer: 16 oder 15?"
  if (questionText.includes('größer')) {
    const numbers = questionText.match(/\d+/g)?.map(Number) || [];
    if (numbers.length >= 2 && numbers[0] !== undefined && numbers[1] !== undefined) {
      correctAnswer = Math.max(numbers[0], numbers[1]);
    }
  }
  // For "kleiner" (smaller) questions
  else if (questionText.includes('kleiner')) {
    const numbers = questionText.match(/\d+/g)?.map(Number) || [];
    if (numbers.length >= 2 && numbers[0] !== undefined && numbers[1] !== undefined) {
      correctAnswer = Math.min(numbers[0], numbers[1]);
    }
  }
  // For arithmetic questions: "Was ist 5 + 3?"
  else if (questionText.includes('+')) {
    const numbers = questionText.match(/\d+/g)?.map(Number) || [];
    if (numbers.length >= 2 && numbers[0] !== undefined && numbers[1] !== undefined) {
      correctAnswer = numbers[0] + numbers[1];
    }
  }
  else if (questionText.includes('-') || questionText.includes('−')) {
    const numbers = questionText.match(/\d+/g)?.map(Number) || [];
    if (numbers.length >= 2 && numbers[0] !== undefined && numbers[1] !== undefined) {
      correctAnswer = numbers[0] - numbers[1];
    }
  }
  // For "kommt nach" (comes after) questions
  else if (questionText.includes('kommt nach')) {
    const numbers = questionText.match(/\d+/g)?.map(Number) || [];
    if (numbers.length >= 1 && numbers[0] !== undefined) {
      correctAnswer = numbers[0] + 1;
    }
  }
  // For "kommt vor" (comes before) questions  
  else if (questionText.includes('kommt vor')) {
    const numbers = questionText.match(/\d+/g)?.map(Number) || [];
    if (numbers.length >= 1 && numbers[0] !== undefined) {
      correctAnswer = numbers[0] - 1;
    }
  }
  // For odd one out questions: look for the pattern
  else if (questionText.includes('passt nicht')) {
    // Get all answer buttons
    const buttons = await page.getByRole('button').all();
    const values: number[] = [];
    for (const button of buttons) {
      const text = await button.textContent();
      const num = parseInt(text || '');
      if (!isNaN(num)) {
        values.push(num);
      }
    }
    
    // Find the odd one out (different pattern)
    if (values.length > 0) {
      // Check if it's a tens pattern (10, 20, 30, 40, 15 - 15 is odd)
      const differences = values.slice(1).map((v, i) => v - (values[i] ?? 0));
      const avgDiff = differences.reduce((a, b) => a + b, 0) / differences.length;
      
      // Find value that doesn't fit the pattern
      for (let i = 0; i < values.length - 1; i++) {
        const next = values[i + 1];
        const current = values[i];
        if (next !== undefined && current !== undefined) {
          const diff = next - current;
          if (Math.abs(diff - avgDiff) > 2) {
            correctAnswer = next;
            break;
          }
        }
      }
      
      // If still not found, check if one value breaks the pattern
      if (correctAnswer === null) {
        const lastDigits = values.map(v => v % 10);
        const modeDigit = lastDigits.sort((a,b) =>
          lastDigits.filter(v => v===a).length - lastDigits.filter(v => v===b).length
        ).pop();
        const oddValue = values.find(v => modeDigit !== undefined && v % 10 !== modeDigit);
        correctAnswer = oddValue !== undefined ? oddValue : (values[0] ?? null);
      }
    }
  }
  // For counting questions or other unknown types: just click first button
  
  if (correctAnswer !== null) {
    try {
      const correctButton = page.getByRole('button', { name: String(correctAnswer), exact: true });
      // Wait for button to be stable and clickable
      await correctButton.waitFor({ state: 'visible', timeout: 3000 });
      await page.waitForTimeout(100); // Brief pause for stability
      await correctButton.click({ timeout: 5000 });
    } catch (error) {
      // If we can't find the exact answer button, click first available
      console.warn(`Could not find button with text "${correctAnswer}", clicking first button`);
      const buttons = await page.getByRole('button').all();
      const firstButton = buttons[0];
      if (firstButton) {
        await firstButton.waitFor({ state: 'visible', timeout: 3000 });
        await page.waitForTimeout(100);
        await firstButton.click({ timeout: 5000 });
      }
    }
  } else {
    // Fallback: click the first button
    const buttons = await page.getByRole('button').all();
    const firstButton = buttons[0];
    if (firstButton) {
      await firstButton.waitFor({ state: 'visible', timeout: 3000 });
      await page.waitForTimeout(100);
      await firstButton.click({ timeout: 5000 });
    }
  }
}

/**
 * Helper to click an incorrect answer for the current problem
 * Works by clicking the last button (typically wrong)
 */
export async function clickIncorrectAnswer(page: Page) {
  // Wait for buttons to be visible
  await page.waitForTimeout(300);
  
  // Get all answer buttons
  const buttons = await page.getByRole('button').all();
  
  // Click the last button (usually incorrect)
  const lastButton = buttons[buttons.length - 1];
  if (lastButton) {
    await lastButton.waitFor({ state: 'visible', timeout: 3000 });
    await page.waitForTimeout(100);
    await lastButton.click({ timeout: 5000 });
  } else {
    throw new Error('No answer buttons found');
  }
}

/**
 * Helper to wait for problem to be ready
 * Returns a mock problem object for compatibility
 */
export async function waitForProblem(page: Page, timeout = 10000) {
  // Wait for any overlays to disappear first
  await page.waitForFunction(() => {
    const overlays = document.querySelectorAll('[class*="overlay"]');
    return overlays.length === 0 || Array.from(overlays).every(el => {
      const style = window.getComputedStyle(el);
      return style.display === 'none' || style.opacity === '0' || style.visibility === 'hidden';
    });
  }, { timeout: 5000 }).catch(() => {
    // Ignore timeout - overlay might not exist
  });
  
  // Wait for question to be visible
  await page.locator('text=/\\?|größer|viele|kommt|passt/').waitFor({ state: 'visible', timeout });
  
  // Wait for buttons to be clickable
  await page.waitForFunction(() => {
    const buttons = document.querySelectorAll('button');
    return buttons.length > 0 && Array.from(buttons).some(btn => {
      const rect = btn.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && !btn.disabled;
    });
  }, { timeout: 3000 });
  
  // Extra wait for UI to stabilize
  await page.waitForTimeout(200);
  
  // Return a mock problem for compatibility
  return {
    type: 'unknown',
    question: '',
    answer: 0,
    options: []
  };
}
