import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// ============================================================================
// SPECIFIC TEST: LEALTIS NAVIGATION LINKS
// ============================================================================

test('lealtis navigation links should have /lealtis prefix', async ({ page }) => {
  // Go to lealtis homepage
  await page.goto('/lealtis', { waitUntil: 'networkidle' })
  
  // Get all links from the page
  const allLinks = await page.locator('a[href]').all()
  
  const incorrectLinks: string[] = []
  
  for (const link of allLinks) {
    const href = await link.getAttribute('href')
    if (!href) continue
    
    // Skip external links
    if (href.startsWith('http')) continue
    // Skip anchors
    if (href.startsWith('#')) continue
    // Skip email/phone
    if (href.includes('mailto:') || href.includes('tel:')) continue
    
    // These are the INCORRECT patterns (missing /lealtis prefix)
    const incorrectPatterns = [
      '/programas',
      '/por-que-paraguay', 
      '/como-funciona',
      '/precios',
      '/comparar',
      '/faq',
      '/blog',
      '/contacto',
      '/nosotros',
      '/calculadora',
      '/checklist',
      '/banking',
      '/impuestos',
      '/guia-gratis',
      '/costo-de-vida',
      '/barrios',
      '/partners',
    ]
    
    for (const pattern of incorrectPatterns) {
      if (href === pattern || href.startsWith(pattern + '/')) {
        incorrectLinks.push(href)
        break
      }
    }
  }
  
  // Log for debugging
  if (incorrectLinks.length > 0) {
    console.log('Found incorrect links:', incorrectLinks)
  }
  
  // This should FAIL if there are incorrect links (which proves the bug exists)
  expect(incorrectLinks).toHaveLength(0)
})

// ============================================================================
// TEST: Verify all expected links exist
// ============================================================================

test('lealtis should have all expected navigation links', async ({ page }) => {
  await page.goto('/lealtis', { waitUntil: 'networkidle' })
  
  const expectedLinks = [
    '/lealtis/programas',
    '/lealtis/por-que-paraguay',
    '/lealtis/como-funciona',
    '/lealtis/precios',
    '/lealtis/comparar',
    '/lealtis/faq',
    '/lealtis/blog',
  ]
  
  for (const expectedLink of expectedLinks) {
    const link = page.locator(`a[href="${expectedLink}"]`)
    await expect(link).toBeVisible({ timeout: 5000 })
  }
})
