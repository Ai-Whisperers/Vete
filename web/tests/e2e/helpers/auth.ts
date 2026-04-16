import { Page } from '@playwright/test'

export async function loginAs(page: Page, role: 'owner' | 'vet' | 'admin') {
  await page.goto('/portal/login')
  await page.locator('input[type="email"]').fill('test@example.com')
  await page.locator('input[type="password"]').fill('password123')
  await page.locator('button[type="submit"]').click()
}

export async function logout(page: Page) {
  await page.goto('/portal/logout')
}

export async function isLoggedIn(page: Page): Promise<boolean> {
  const isLoggedIn = await page.locator('text=Dashboard').isVisible()
  return isLoggedIn
}