import { test, expect } from '@playwright/test';
import { loginAs, logout, verifyUnauthorizedAccess, isLoggedIn } from '../helpers/auth';
import { verifyUrl, waitForHeading } from '../helpers/navigation';

/**
 * Authentication Tests - Login Flows
 * 
 * Verifies that users can log in with correct credentials and are redirected
 * to the appropriate area based on their role. Also verifies that role-based
 * access control is enforced correctly.
 * 
 * Test Coverage:
 * - Owner login and portal access
 * - Vet login and dashboard access
 * - Admin login and full access
 * - Role-based access restrictions
 * - Invalid credentials handling
 */

test.describe('Authentication - Login Flows', () => {
  test.describe('Pet Owner Login', () => {
    test('should login as owner and access pet portal @owner @adris', async ({ page }) => {
      // Act: Login as pet owner
      await loginAs(page, 'adris', 'owner');

      // Assert: Redirected to pet owner portal
      await verifyUrl(page, /\/adris\/portal/);

      // Assert: Portal content visible - check for greeting or portal actions
      const portalContent = page.getByRole('heading', { name: /good (morning|afternoon|evening)/i }).or(
        page.getByRole('link', { name: /book appointment|add pet/i })
      );
      await expect(portalContent.first()).toBeVisible();

      // Assert: Can see pet-related content or actions
      const petContent = page.getByRole('link', { name: /vaccine|view profile/i }).or(
        page.getByText(/weight|vaccines/i)
      );
      await expect(petContent.first()).toBeVisible();

      // Assert: User is logged in
      const loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);
    });

    test('should prevent owner from accessing staff dashboard @owner @adris @security', async ({ page }) => {
      // Arrange: Login as owner
      await loginAs(page, 'adris', 'owner');

      // Act: Try to access staff dashboard
      await verifyUnauthorizedAccess(page, '/adris/dashboard', /\/adris\/portal/);

      // Assert: Should be redirected back to portal, not dashboard
      await verifyUrl(page, /\/adris\/portal/);
    });

    test('should prevent owner from accessing admin panel @owner @adris @security', async ({ page }) => {
      // Arrange: Login as owner
      await loginAs(page, 'adris', 'owner');

      // Act: Try to access admin panel
      await verifyUnauthorizedAccess(page, '/adris/admin', /\/adris\/portal/);

      // Assert: Should be redirected back to portal
      await verifyUrl(page, /\/adris\/portal/);
    });
  });

  test.describe('Veterinarian Login', () => {
    test('should login as vet and access staff dashboard @vet @adris', async ({ page }) => {
      // Act: Login as veterinarian
      await loginAs(page, 'adris', 'vet');

      // Assert: Redirected to staff dashboard
      await verifyUrl(page, /\/adris\/dashboard/);

      // Assert: Dashboard navigation visible
      const dashboardNav = page.locator('nav');
      await expect(dashboardNav).toBeVisible();

      // Assert: Can see "Agenda" or "Pacientes" section
      const agendaOrPatients = page.locator('text=Agenda, text=Pacientes').first();
      await expect(agendaOrPatients).toBeVisible({ timeout: 10000 });

      // Assert: User is logged in
      const loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);
    });

    test('should allow vet to access patient management @vet @adris', async ({ page }) => {
      // Arrange: Login as vet
      await loginAs(page, 'adris', 'vet');

      // Act: Navigate to patients section
      await page.goto('/adris/dashboard/patients');

      // Assert: Can access patients page
      await verifyUrl(page, /\/adris\/dashboard\/patients/);
      await waitForHeading(page, 'Pacientes');
    });

    test('should prevent vet from accessing admin panel @vet @adris @security', async ({ page }) => {
      // Arrange: Login as vet
      await loginAs(page, 'adris', 'vet');

      // Act: Try to access admin panel
      await verifyUnauthorizedAccess(page, '/adris/admin', /\/adris\/dashboard/);

      // Assert: Should be redirected back to dashboard
      await verifyUrl(page, /\/adris\/dashboard/);
    });
  });

  test.describe('Administrator Login', () => {
    test('should login as admin and access all areas @admin @adris', async ({ page }) => {
      // Act: Login as administrator
      await loginAs(page, 'adris', 'admin');

      // Assert: Can access admin panel
      await page.goto('/adris/admin');
      await verifyUrl(page, /\/adris\/admin/);

      // Assert: Admin panel content visible
      const adminHeading = page.locator('h1:has-text("Administración"), h2:has-text("Administración")').first();
      await expect(adminHeading).toBeVisible({ timeout: 10000 });

      // Assert: Can also access dashboard
      await page.goto('/adris/dashboard');
      await verifyUrl(page, /\/adris\/dashboard/);

      // Assert: User is logged in
      const loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);
    });

    test('should allow admin to access all modules @admin @adris', async ({ page }) => {
      // Arrange: Login as admin
      await loginAs(page, 'adris', 'admin');

      // Act & Assert: Check access to key modules
      const modules = [
        { path: '/adris/dashboard', name: 'Dashboard' },
        { path: '/adris/admin', name: 'Admin' },
        { path: '/adris/dashboard/patients', name: 'Patients' },
        { path: '/adris/dashboard/appointments', name: 'Appointments' },
      ];

      for (const module of modules) {
        await page.goto(module.path);
        await expect(page).toHaveURL(new RegExp(module.path), {
          timeout: 10000,
        });
      }
    });
  });

  test.describe('Multi-Tenant Login', () => {
    test('should login to different clinics independently @owner @multi-tenant', async ({ page }) => {
      // Act & Assert: Login to Adris
      await loginAs(page, 'adris', 'owner');
      await verifyUrl(page, /\/adris\/portal/);
      await logout(page);

      // Act & Assert: Login to PetLife
      await loginAs(page, 'petlife', 'owner');
      await verifyUrl(page, /\/petlife\/portal/);
    });

    test('should enforce tenant boundaries in URLs @vet @multi-tenant', async ({ page }) => {
      // Arrange: Login to Adris as vet
      await loginAs(page, 'adris', 'vet');

      // Act: Try to access PetLife dashboard with Adris credentials
      await page.goto('/petlife/dashboard');

      // Assert: Should be redirected or show unauthorized
      // (Exact behavior depends on implementation)
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('/petlife/dashboard');
    });
  });

  test.describe('Invalid Credentials', () => {
    test('should reject invalid email @unauthenticated @adris', async ({ page }) => {
      // Arrange
      await page.goto('/adris/login');

      // Act: Try to login with invalid email
      await page.fill('input[name="email"]', 'nonexistent@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Assert: Should show error message
      await page.waitForTimeout(2000); // Wait for error message
      const errorMessage = page.locator('text=credenciales, text=error, text=incorrecto').first();
      await expect(errorMessage).toBeVisible({ timeout: 5000 });

      // Assert: Should still be on login page
      await verifyUrl(page, /\/login/);
    });

    test('should reject invalid password @unauthenticated @adris', async ({ page }) => {
      // Arrange
      await page.goto('/adris/login');

      // Act: Try to login with valid email but wrong password
      await page.fill('input[name="email"]', 'owner@adris.demo');
      await page.fill('input[name="password"]', 'wrongpassword123');
      await page.click('button[type="submit"]');

      // Assert: Should show error message
      await page.waitForTimeout(2000);
      const errorMessage = page.locator('text=credenciales, text=error, text=incorrecto').first();
      await expect(errorMessage).toBeVisible({ timeout: 5000 });

      // Assert: Should still be on login page
      await verifyUrl(page, /\/login/);
    });

    test('should reject empty credentials @unauthenticated @adris', async ({ page }) => {
      // Arrange
      await page.goto('/adris/login');

      // Act: Try to submit empty form
      await page.click('button[type="submit"]');

      // Assert: Should show validation errors or prevent submission
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      expect(currentUrl).toContain('/login');
    });
  });

  test.describe('Unauthenticated Access', () => {
    test('should redirect unauthenticated user from protected routes @unauthenticated @security', async ({ page }) => {
      // Act & Assert: Try to access portal without login
      await verifyUnauthorizedAccess(page, '/adris/portal', /\/login/);

      // Act & Assert: Try to access dashboard without login
      await verifyUnauthorizedAccess(page, '/adris/dashboard', /\/login/);

      // Act & Assert: Try to access admin without login
      await verifyUnauthorizedAccess(page, '/adris/admin', /\/login/);
    });

    test('should allow access to public pages @unauthenticated @public', async ({ page }) => {
      // Act: Visit home page
      await page.goto('/adris');

      // Assert: Should load successfully
      await expect(page).toHaveURL(/\/adris/);

      // Assert: Should show login link or button
      const loginLink = page.locator('a:has-text("Iniciar sesión"), button:has-text("Iniciar sesión")').first();
      await expect(loginLink).toBeVisible({ timeout: 10000 });
    });
  });
});
