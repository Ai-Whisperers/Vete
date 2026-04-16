import { Page } from '@playwright/test'

export async function verifyUrl(page: Page, url: string) {
  await page.waitForURL(url)
}

export async function waitForHeading(page: Page, heading: string) {
  await page.locator(`h1:has-text("${heading}")`).waitFor()
}