import { _electron, test, expect } from '@playwright/test';
import { db } from '../__helpers__/db';

export async function setupTest(page: any) {
  // Setup test database
  await db.setup();

  // Setup test user
  const user = await db.createUser();

  // Login user
  await page.goto('/login');
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');

  // Wait for login to complete
  await page.waitForNavigation();
}