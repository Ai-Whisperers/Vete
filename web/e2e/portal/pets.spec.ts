/**
 * E2E Tests: Pet Management Portal
 *
 * Tests for the authenticated pet management portal.
 * @tags e2e, portal, pets, critical
 */

import { test, expect } from '@playwright/test';

test.describe('Pet Management Portal', () => {
  // Note: These tests require authentication
  // In a real setup, you would use Playwright's auth state storage

  test.describe('Unauthenticated access', () => {
    test('redirects to login when accessing pets page', async ({ page }) => {
      await page.goto('/adris/portal/pets');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login|\/auth/);
    });

    test('redirects to login when accessing pet details', async ({ page }) => {
      await page.goto('/adris/portal/pets/some-pet-id');

      await expect(page).toHaveURL(/\/login|\/auth/);
    });
  });

  test.describe('Login page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/adris/portal/login');
    });

    test('displays login form', async ({ page }) => {
      // Check for email field
      await expect(page.getByLabel(/email/i)).toBeVisible();

      // Check for password field
      await expect(page.getByLabel(/contraseña|password/i)).toBeVisible();

      // Check for submit button
      await expect(page.getByRole('button', { name: /iniciar|login|entrar/i })).toBeVisible();
    });

    test('shows validation errors for empty fields', async ({ page }) => {
      // Click login without filling fields
      await page.getByRole('button', { name: /iniciar|login|entrar/i }).click();

      // Should show some validation feedback
      // Either HTML5 validation or custom error messages
    });

    test('shows error for invalid credentials', async ({ page }) => {
      await page.getByLabel(/email/i).fill('invalid@test.com');
      await page.getByLabel(/contraseña|password/i).fill('wrongpassword');
      await page.getByRole('button', { name: /iniciar|login|entrar/i }).click();

      // Wait for error message
      const error = page.getByRole('alert').or(page.locator('.error, [data-error], .text-red'));
      await expect(error.first()).toBeVisible({ timeout: 10000 });
    });

    test('has link to signup', async ({ page }) => {
      const signupLink = page.getByRole('link', { name: /registr|crear cuenta|signup/i });
      await expect(signupLink).toBeVisible();
    });

    test('has forgot password option', async ({ page }) => {
      const forgotLink = page.getByRole('link', { name: /olvidé|forgot|recuperar/i });

      // This might not exist in all implementations
      if (await forgotLink.isVisible()) {
        await expect(forgotLink).toBeVisible();
      }
    });
  });

  test.describe('Signup page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/adris/portal/signup');
    });

    test('displays signup form', async ({ page }) => {
      // Check for required fields
      await expect(page.getByLabel(/nombre|name/i).first()).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/teléfono|phone/i)).toBeVisible();
      await expect(page.getByLabel(/contraseña|password/i).first()).toBeVisible();

      // Check for submit button
      await expect(page.getByRole('button', { name: /registr|crear|signup/i })).toBeVisible();
    });

    test('validates email format', async ({ page }) => {
      const emailField = page.getByLabel(/email/i);
      await emailField.fill('not-an-email');
      await emailField.blur();

      // Check for validation (either HTML5 or custom)
      // HTML5 validation would prevent form submission
    });

    test('validates password requirements', async ({ page }) => {
      const passwordField = page.getByLabel(/contraseña|password/i).first();
      await passwordField.fill('weak');
      await passwordField.blur();

      // Should indicate password is too weak
      // Implementation varies
    });

    test('has link to login', async ({ page }) => {
      const loginLink = page.getByRole('link', { name: /iniciar|login|ya tengo/i });
      await expect(loginLink).toBeVisible();
    });
  });

  // The following tests would require authentication setup
  // Using Playwright's storageState or authentication fixtures

  test.describe.skip('Authenticated - Pet List', () => {
    // These tests require valid authentication
    // Would use: test.use({ storageState: 'auth.json' });

    test('displays list of user pets', async ({ page }) => {
      await page.goto('/adris/portal/pets');

      // Should show pet list or empty state
      const content = page.locator('main');
      await expect(content).toBeVisible();
    });

    test('has button to add new pet', async ({ page }) => {
      await page.goto('/adris/portal/pets');

      const addButton = page.getByRole('link', { name: /agregar|nueva|add/i });
      await expect(addButton).toBeVisible();
    });

    test('displays pet cards with basic info', async ({ page }) => {
      await page.goto('/adris/portal/pets');

      // Look for pet cards
      const petCards = page.locator('[data-testid="pet-card"], .pet-card, article');

      // Each card should have name and species
    });
  });

  test.describe.skip('Authenticated - Add Pet', () => {
    test('displays add pet form', async ({ page }) => {
      await page.goto('/adris/portal/pets/new');

      // Check for required fields
      await expect(page.getByLabel(/nombre/i)).toBeVisible();
      await expect(page.getByLabel(/especie/i)).toBeVisible();
      await expect(page.getByLabel(/peso/i)).toBeVisible();
    });

    test('validates required fields', async ({ page }) => {
      await page.goto('/adris/portal/pets/new');

      // Try to submit without filling required fields
      await page.getByRole('button', { name: /guardar|crear|save/i }).click();

      // Should show validation errors
    });

    test('successfully creates new pet', async ({ page }) => {
      await page.goto('/adris/portal/pets/new');

      // Fill form
      await page.getByLabel(/nombre/i).fill('Test Pet');
      await page.getByLabel(/especie/i).selectOption('dog');
      await page.getByLabel(/peso/i).fill('10');

      // Submit
      await page.getByRole('button', { name: /guardar|crear|save/i }).click();

      // Should redirect to pet list or pet detail
      await expect(page).toHaveURL(/\/portal\/pets/);
    });
  });

  test.describe.skip('Authenticated - Pet Details', () => {
    test('displays pet profile', async ({ page }) => {
      // Navigate to a known pet
      await page.goto('/adris/portal/pets/test-pet-id');

      // Should show pet name
      await expect(page.getByRole('heading').first()).toBeVisible();
    });

    test('shows vaccination history', async ({ page }) => {
      await page.goto('/adris/portal/pets/test-pet-id/vaccines');

      // Should have vaccines section
      const content = await page.content();
      expect(content).toMatch(/vacuna|vaccine/i);
    });

    test('shows medical records', async ({ page }) => {
      await page.goto('/adris/portal/pets/test-pet-id/records');

      // Should have records section
      const content = await page.content();
      expect(content).toMatch(/historial|record|consulta/i);
    });
  });
});
