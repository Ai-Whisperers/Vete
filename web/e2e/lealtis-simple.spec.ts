import { test, expect } from '@playwright/test'

// Simple test that doesn't need Supabase
test.use({ baseURL: process.env.BASE_URL || 'http://localhost:3000' })

test('lealtis homepage loads', async ({ page }) => {
  await page.goto('/lealtis')
  await expect(page).toHaveTitle(/LEALTIS/i)
})

test('lealtis navigation links should have /lealtis prefix', async ({ page }) => {
  await page.goto('/lealtis')
  
  const incorrectLinks: string[] = []
  
  // Get all links
  const links = await page.locator('nav a').all()
  
  for (const link of links) {
    const href = await link.getAttribute('href')
    if (!href) continue
    
    // Skip external, anchors, mailto, tel
    if (href.startsWith('http') || href.startsWith('#') || href.includes('mailto:') || href.includes('tel:')) continue
    
    // These should NOT exist - they should have /lealtis prefix
    const incorrectPatterns = [
      '/programas',
      '/por-que-paraguay', 
      '/como-funciona',
      '/precios',
      '/comparar',
      '/faq',
      '/blog',
      '/contacto',
    ]
    
    for (const pattern of incorrectPatterns) {
      if (href === pattern || href.startsWith(pattern + '/')) {
        incorrectLinks.push(href)
      }
    }
  }
  
  expect(incorrectLinks).toHaveLength(0)
})

test('lealtis has all required nav links', async ({ page }) => {
  await page.goto('/lealtis')
  
  // Check each expected link exists
  const expectedLinks = [
    '/lealtis/programas',
    '/lealtis/por-que-paraguay',
    '/lealtis/como-funciona',
    '/lealtis/precios',
    '/lealtis/comparar',
    '/lealtis/faq',
    '/lealtis/blog',
  ]
  
  for (const link of expectedLinks) {
    const linkElement = page.locator(`nav a[href="${link}"]`)
    await expect(linkElement).toBeVisible()
  }
})
