import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Vete/)
    await expect(page.locator('text=Welcome to Vete')).toBeVisible()
  })

  test('should load about page', async ({ page }) => {
    await page.goto('/about')
    await expect(page).toHaveTitle(/About Vete/)
    await expect(page.locator('text=Our Mission')).toBeVisible()
  })

  test('should load services page', async ({ page }) => {
    await page.goto('/services')
    await expect(page).toHaveTitle(/Services/)
    await expect(page.locator('text=Consultation')).toBeVisible()
  })

  test('should load portal login page', async ({ page }) => {
    await page.goto('/portal/login')
    await expect(page).toHaveTitle(/Login/)
    await expect(page.locator('text=Email')).toBeVisible()
    await expect(page.locator('text=Password')).toBeVisible()
  })

  test('should load portal dashboard page', async ({ page }) => {
    // Arrange: Login as owner
    await page.goto('/portal/login')
    await page.locator('input[type="email"]').fill('test@example.com')
    await page.locator('input[type="password"]').fill('password123')
    await page.locator('button[type="submit"]').click()

    // Act: Navigate to dashboard
    await page.goto('/portal/dashboard')

    // Assert: Dashboard content visible
    await expect(page.locator('text=Dashboard')).toBeVisible()
    await expect(page.locator('text=Appointments')).toBeVisible()
  })
})