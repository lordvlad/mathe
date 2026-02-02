import { test, expect } from '@playwright/test';
import { 
  clickCorrectAnswer, 
  clickIncorrectAnswer, 
  waitForProblem, 
  clearGameState 
} from './helpers';

test.describe('Math Game Complete Flow', () => {
  test('should complete a full game session with all correct answers', async ({ page }) => {
    // 1. Navigate to the game
    await page.goto('/');
    
    // Clear any existing state
    await clearGameState(page);
    
    // 2. Welcome screen should be visible
    await expect(page.getByText('Wähle deinen Begleiter!')).toBeVisible();
    
    // 3. Select an animal (rabbit/Hase)
    const rabbitCard = page.locator('[alt="Hase"]').first();
    await expect(rabbitCard).toBeVisible();
    await rabbitCard.click();
    
    // 4. Start button should appear and be clickable
    const startButton = page.getByRole('button', { name: /Los geht's/i });
    await expect(startButton).toBeVisible();
    await startButton.click();
    
    // 5. Progress bar should be visible
    await expect(page.getByText(/Aufgabe \d+ von 10/)).toBeVisible();
    
    // 6. Complete all 10 problems with correct answers
    for (let i = 1; i <= 10; i++) {
      // Wait for problem to be ready
      await waitForProblem(page);
      
      // Click the correct answer
      await clickCorrectAnswer(page);
      
      // Verify correct feedback appears
      await expect(page.getByText(/Richtig|Super|Toll/i)).toBeVisible({ timeout: 2000 });
      
      // Wait for feedback to disappear
      await page.waitForTimeout(1500);
      
      // Check if halfway celebration appears (after 5th problem)
      if (i === 5) {
        const halfwayText = page.getByText(/Super gemacht/i);
        const isVisible = await halfwayText.isVisible().catch(() => false);
        if (isVisible) {
          // Click to dismiss halfway celebration
          await page.locator('body').click({ position: { x: 10, y: 10 } });
          await page.waitForTimeout(500);
        }
      }
    }
    
    // 7. Session complete screen should appear with perfect score
    await expect(page.getByText(/Perfekt!|🎉/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('10/10 richtig')).toBeVisible();
    
    // 8. Play again button should be visible
    const playAgainButton = page.getByRole('button', { name: /Nochmal spielen/i });
    await expect(playAgainButton).toBeVisible();
    await playAgainButton.click();
    
    // 9. Should return to welcome screen
    await expect(page.getByText('Wähle deinen Begleiter!')).toBeVisible();
  });

  test('should handle mix of correct and incorrect answers', async ({ page }) => {
    await page.goto('/');
    
    // Select animal and start
    await page.locator('[alt="Hund"]').first().click();
    await page.getByRole('button', { name: /Los geht's/i }).click();
    
    let correctCount = 0;
    
    // Answer 10 questions - mix of correct and incorrect
    for (let i = 1; i <= 10; i++) {
      await waitForProblem(page);
      
      // Answer correctly for odd numbers, incorrectly for even
      if (i % 2 === 1) {
        await clickCorrectAnswer(page);
        correctCount++;
        await expect(page.getByText(/Richtig|Super|Toll/i)).toBeVisible({ timeout: 2000 });
      } else {
        await clickIncorrectAnswer(page);
        await expect(page.getByText(/Nicht ganz|Versuche es nochmal/i)).toBeVisible({ timeout: 2000 });
      }
      
      await page.waitForTimeout(1500);
      
      // Dismiss halfway celebration if it appears
      if (i === 5) {
        const halfwayVisible = await page.getByText(/Super gemacht/i).isVisible().catch(() => false);
        if (halfwayVisible) {
          await page.locator('body').click({ position: { x: 10, y: 10 } });
          await page.waitForTimeout(500);
        }
      }
    }
    
    // Session complete should show score
    await expect(page.getByText(/Geschafft!|Super!|Toll/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(`${correctCount}/10 richtig`)).toBeVisible();
  });

  test('should show halfway celebration after 5 problems', async ({ page }) => {
    await page.goto('/');
    
    // Select animal and start
    await page.locator('[alt="Fuchs"]').first().click();
    await page.getByRole('button', { name: /Los geht's/i }).click();
    
    // Answer first 5 questions correctly
    for (let i = 1; i <= 5; i++) {
      await waitForProblem(page);
      await clickCorrectAnswer(page);
      await page.waitForTimeout(1500);
    }
    
    // Halfway celebration should appear
    await expect(page.getByText(/Super gemacht/i)).toBeVisible({ timeout: 3000 });
    await expect(page.getByText(/Noch 5 Aufgaben/i)).toBeVisible();
    
    // Click to dismiss
    await page.locator('body').click({ position: { x: 10, y: 10 } });
    
    // Should continue with question 6
    await waitForProblem(page);
    await expect(page.getByText(/Aufgabe 6 von 10/)).toBeVisible();
  });

  test('should display all 8 animals in selector', async ({ page }) => {
    await page.goto('/');
    
    // Check that all 8 animals are displayed
    const animals = ['Hase', 'Bär', 'Fuchs', 'Hund', 'Katze', 'Panda', 'Koala', 'Löwe'];
    
    for (const animal of animals) {
      await expect(page.locator(`[alt="${animal}"]`)).toBeVisible();
    }
  });

  test('should show progress updates', async ({ page }) => {
    await page.goto('/');
    
    // Select animal and start
    await page.locator('[alt="Katze"]').first().click();
    await page.getByRole('button', { name: /Los geht's/i }).click();
    
    // Check initial progress
    await expect(page.getByText('Aufgabe 1 von 10')).toBeVisible();
    
    // Answer first question
    await waitForProblem(page);
    await clickCorrectAnswer(page);
    await page.waitForTimeout(2000);
    
    // Progress should update to 2
    await expect(page.getByText('Aufgabe 2 von 10')).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab to first animal
    await page.keyboard.press('Tab');
    
    // Enter should select
    await page.keyboard.press('Enter');
    
    // Tab to start button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Game should start
    await expect(page.getByText(/Aufgabe \d+ von 10/)).toBeVisible();
  });

  test('should persist state in localStorage', async ({ page }) => {
    await page.goto('/');
    
    // Select animal
    await page.locator('[alt="Bär"]').first().click();
    
    // Check that state was saved
    const state = await page.evaluate(() => {
      const data = localStorage.getItem('game-store');
      return data ? JSON.parse(data) : null;
    });
    
    expect(state).toBeTruthy();
    expect(state.state?.selectedAnimal).toBe('bear');
  });

  test('should show different problem types', async ({ page }) => {
    await page.goto('/');
    
    // Select animal and start
    await page.locator('[alt="Panda"]').first().click();
    await page.getByRole('button', { name: /Los geht's/i }).click();
    
    const problemTypes = new Set<string>();
    
    // Collect problem types from 10 questions
    for (let i = 1; i <= 10; i++) {
      const problem = await waitForProblem(page);
      problemTypes.add(problem.type);
      
      await clickCorrectAnswer(page);
      await page.waitForTimeout(1500);
      
      // Dismiss halfway celebration
      if (i === 5) {
        const halfwayVisible = await page.getByText(/Super gemacht/i).isVisible().catch(() => false);
        if (halfwayVisible) {
          await page.locator('body').click({ position: { x: 10, y: 10 } });
          await page.waitForTimeout(500);
        }
      }
    }
    
    // Should have at least 3 different problem types in 10 questions
    expect(problemTypes.size).toBeGreaterThanOrEqual(3);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Elements should still be visible
    await expect(page.getByText('Wähle deinen Begleiter!')).toBeVisible();
    
    // Animal grid should be visible
    await expect(page.locator('[alt="Hase"]')).toBeVisible();
    
    // Start a game
    await page.locator('[alt="Hase"]').first().click();
    await page.getByRole('button', { name: /Los geht's/i }).click();
    
    // Progress bar should be visible
    await expect(page.getByText(/Aufgabe 1 von 10/)).toBeVisible();
  });
});
