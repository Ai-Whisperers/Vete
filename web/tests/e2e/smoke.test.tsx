import { test, expect } from '@playwright/test';
import { setupTest } from '../__helpers__/integration-setup';

test.describe('Smoke tests', () => {
  test('should load homepage', async ({ page }) => {
    await setupTest(page);
    await page.goto('/');
    await expect(page).toContainText('Vete');
  });

  test('should load login page', async ({ page }) => {
    await setupTest(page);
    await page.goto('/login');
    await expect(page).toContainText('Login');
  });

  test('should load dashboard page', async ({ page }) => {
    await setupTest(page);
    await page.goto('/dashboard');
    await expect(page).toContainText('Dashboard');
  });
});