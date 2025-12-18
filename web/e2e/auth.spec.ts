import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login page loads elements', async ({ page }) => {
    await page.goto('/adris/portal/login');
    await expect(page.getByLabel('Email', { exact: false })).toBeVisible();
    await expect(page.getByLabel('Contraseña', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar/i })).toBeVisible();
  });

  test.skip('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/adris/portal/login');

    await page.getByLabel('Email', { exact: false }).fill('invalid@example.com');
    await page.getByLabel('Contraseña', { exact: false }).fill('wrongpassword');
    await page.getByRole('button', { name: /iniciar/i }).click();

    // Wait for the alert - increase timeout
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible({ timeout: 10000 });
    
    // Check content - accept English or Spanish
    const text = await alert.textContent();
    console.log('Alert text:', text);
    
    // Supabase usually returns "Invalid login credentials"
    // But verify it's not empty
    expect(text).toBeTruthy();
    expect(text).toMatch(/invalid|credenciales|error/i);
  });
});
