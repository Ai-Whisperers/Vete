import { test, expect } from '@playwright/test';
import { loginAs, logout, isLoggedIn } from '../helpers/auth';
import { verifyUrl } from '../helpers/navigation';

/**
 * Authentication Tests - Logout and Session Management
 * 
 * Verifies that users can securely log out and that sessions are properly
 * terminated. Tests that logged-out users cannot access protected routes.
 * 
 * Test Coverage:
 * - Successful logout for all roles
 * - Session termination
 * - Protected route access after logout
 * - Logout from different pages
 */

test.describe('Authentication - Logout and Session Management', () => {
  test.describe('Logout Functionality', () => {
    test('should logout owner successfully @owner @adris', async ({ page }) => {
      // Arrange: Login as owner
      await loginAs(page, 'adris', 'owner');
      await verifyUrl(page, /\/adris\/portal/);

      // Verify logged in
      let loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);

      // Act: Logout
      await logout(page);

      // Assert: Redirected to login page
      await verifyUrl(page, /\/login/);

      // Assert: No longer logged in
      loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(false);

      // Assert: Login form visible
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should logout vet successfully @vet @adris', async ({ page }) => {
      // Arrange: Login as vet
      await loginAs(page, 'adris', 'vet');
      await verifyUrl(page, /\/adris\/dashboard/);

      // Act: Logout
      await logout(page);

      // Assert: Redirected to login page
      await verifyUrl(page, /\/login/);

      // Assert: Login form visible
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });

    test('should logout admin successfully @admin @adris', async ({ page }) => {
      // Arrange: Login as admin
      await loginAs(page, 'adris', 'admin');

      // Act: Logout
      await logout(page);

      // Assert: Redirected to login page
      await verifyUrl(page, /\/login/);

      // Assert: Login form visible
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });
  });

  test.describe('Session Termination', () => {
    test('should prevent access to portal after logout @owner @adris @security', async ({ page }) => {
      // Arrange: Login and then logout
      await loginAs(page, 'adris', 'owner');
      await logout(page);

      // Act: Try to access portal
      await page.goto('/adris/portal');

      // Assert: Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

      // Assert: Cannot see portal content
      const portalContent = page.locator('text=Mis Mascotas');
      await expect(portalContent).not.toBeVisible();
    });

    test('should prevent access to dashboard after logout @vet @adris @security', async ({ page }) => {
      // Arrange: Login and then logout
      await loginAs(page, 'adris', 'vet');
      await logout(page);

      // Act: Try to access dashboard
      await page.goto('/adris/dashboard');

      // Assert: Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

      // Assert: Cannot see dashboard content
      const dashboardContent = page.locator('text=Agenda, text=Pacientes').first();
      await expect(dashboardContent).not.toBeVisible();
    });

    test('should prevent API calls after logout @owner @adris @security', async ({ page }) => {
      // Arrange: Login as owner
      await loginAs(page, 'adris', 'owner');

      // Setup API response listener
      const apiCalls: string[] = [];
      page.on('response', (response) => {
        if (response.url().includes('/api/')) {
          apiCalls.push(response.url());
        }
      });

      // Act: Logout
      await logout(page);

      // Try to call a protected API endpoint
      const response = await page.request.get('/api/pets');

      // Assert: Should return 401 Unauthorized
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Logout from Different Pages', () => {
    test('should logout from portal home page @owner @adris', async ({ page }) => {
      // Arrange: Login and stay on portal home
      await loginAs(page, 'adris', 'owner');
      await page.goto('/adris/portal');

      // Act: Logout
      await logout(page);

      // Assert: Redirected to login
      await verifyUrl(page, /\/login/);
    });

    test('should logout from nested portal page @owner @adris', async ({ page }) => {
      // Arrange: Login and navigate to nested page
      await loginAs(page, 'adris', 'owner');
      await page.goto('/adris/portal/pets');
      await expect(page).toHaveURL(/\/adris\/portal\/pets/, { timeout: 10000 });

      // Act: Logout
      await logout(page);

      // Assert: Redirected to login
      await verifyUrl(page, /\/login/);
    });

    test('should logout from dashboard page @vet @adris', async ({ page }) => {
      // Arrange: Login and navigate to dashboard
      await loginAs(page, 'adris', 'vet');
      await page.goto('/adris/dashboard/patients');
      await expect(page).toHaveURL(/\/adris\/dashboard\/patients/, { timeout: 10000 });

      // Act: Logout
      await logout(page);

      // Assert: Redirected to login
      await verifyUrl(page, /\/login/);
    });
  });

  test.describe('Session Persistence', () => {
    test('should maintain session across page refreshes @owner @adris', async ({ page }) => {
      // Arrange: Login as owner
      await loginAs(page, 'adris', 'owner');
      await verifyUrl(page, /\/adris\/portal/);

      // Act: Refresh page
      await page.reload({ waitUntil: 'networkidle' });

      // Assert: Still logged in
      await verifyUrl(page, /\/adris\/portal/);
      const loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);
    });

    test('should maintain session across navigation @owner @adris', async ({ page }) => {
      // Arrange: Login as owner
      await loginAs(page, 'adris', 'owner');

      // Act: Navigate to different portal pages
      await page.goto('/adris/portal/pets');
      await page.goto('/adris/portal/appointments');
      await page.goto('/adris/portal');

      // Assert: Still logged in on all pages
      const loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);
    });

    test('should not persist session after logout and refresh @owner @adris', async ({ page }) => {
      // Arrange: Login and logout
      await loginAs(page, 'adris', 'owner');
      await logout(page);

      // Act: Refresh page
      await page.reload({ waitUntil: 'networkidle' });

      // Assert: Still on login page
      await verifyUrl(page, /\/login/);

      // Assert: Still logged out
      const loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(false);
    });
  });

  test.describe('Multi-Tenant Logout', () => {
    test('should logout from one clinic and login to another @owner @multi-tenant', async ({ page }) => {
      // Arrange: Login to Adris
      await loginAs(page, 'adris', 'owner');
      await verifyUrl(page, /\/adris\/portal/);

      // Act: Logout from Adris
      await logout(page);

      // Act: Login to PetLife
      await loginAs(page, 'petlife', 'owner');

      // Assert: Now logged in to PetLife
      await verifyUrl(page, /\/petlife\/portal/);
      const loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);
    });

    test('should not have cross-tenant session @owner @multi-tenant @security', async ({ page }) => {
      // Arrange: Login to Adris
      await loginAs(page, 'adris', 'owner');

      // Act: Try to access PetLife portal (without logging in there)
      await page.goto('/petlife/portal');

      // Assert: Should redirect to PetLife login
      // (Session from Adris should not work for PetLife)
      await expect(page).toHaveURL(/\/petlife\/login/, { timeout: 10000 });
    });
  });
});
