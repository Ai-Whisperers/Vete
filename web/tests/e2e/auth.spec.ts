import { test, expect } from '@playwright/test'
import { loginAs, logout, isLoggedIn } from '../helpers/auth'

test.describe('Authentication', () => {
  test('should login as owner', async ({ page }) => {
    await loginAs(page, 'owner')
    await expect(isLoggedIn(page)).toBe(true)
  })

  test('should login as vet', async ({ page }) => {
    await loginAs(page, 'vet')
    await expect(isLoggedIn(page)).toBe(true)
  })

  test('should login as admin', async ({ page }) => {
    await loginAs(page, 'admin')
    await expect(isLoggedIn(page)).toBe(true)
  })

  test('should logout', async ({ page }) => {
    await loginAs(page, 'owner')
    await logout(page)
    await expect(isLoggedIn(page)).toBe(false)
  })
})