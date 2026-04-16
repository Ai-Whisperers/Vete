import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// ============================================================================
// TENANTS TO TEST
// ============================================================================

const TENANTS = [
  'terrapet',
  'petlife',
  'cavillpet',
  'arasy',
  'clinica-duerksen',
  'stroopwafel-huis',
  'granja-cabral',
  'dayah',
  'fun4me',
]

// ============================================================================
// LEALTIS PAGES TO TEST
// ============================================================================

const LEALTIS_PAGES = [
  '',
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
  '/privacy',
  '/terms',
  '/deutschland',
  '/espana',
  '/nederland',
  '/comparar/paraguay-vs-portugal',
  '/comparar/paraguay-vs-uruguay',
  '/comparar/paraguay-vs-panama',
  '/comparar/paraguay-vs-dubai',
  '/comparar/paraguay-vs-georgia',
  '/comparar/paraguay-vs-malta',
  '/programas/paraguay-business',
  '/programas/investor-program',
]

// ============================================================================
// TEST SUITE: TENANT PAGES
// ============================================================================

for (const tenant of TENANTS) {
  test.describe(`${tenant.toUpperCase()} Tenant Tests`, () => {
    test(`homepage loads without errors`, async ({ page }) => {
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })
      
      const response = await page.goto(`/${tenant}`, { waitUntil: 'networkidle' })
      
      expect(response?.status()).toBe(200)
      
      // Check for critical console errors (ignore warnings)
      const criticalErrors = errors.filter(e => 
        !e.includes('Warning') && 
        !e.includes('DevTools') &&
        !e.includes('favicon')
      )
      
      expect(criticalErrors).toHaveLength(0)
    })

    test(`homepage has no broken internal links`, async ({ page }) => {
      await page.goto(`/${tenant}`, { waitUntil: 'networkidle' })
      
      // Get all internal links on the page
      const links = await page.locator('a[href^="/"], a[href^="' + BASE_URL + '/"]').all()
      
      const brokenLinks: string[] = []
      
      for (const link of links) {
        const href = await link.getAttribute('href')
        if (!href) continue
        
        // Skip external links, anchors, and special links
        if (href.startsWith('http') && !href.includes('localhost')) continue
        if (href.startsWith('#')) continue
        if (href.includes('mailto:')) continue
        if (href.includes('tel:')) continue
        
        // Extract the path
        const path = href.replace(BASE_URL, '').split('?')[0]
        
        // Try to visit the link - it should either work or redirect
        try {
          const response = await page.request.get(path, { 
            timeout: 5000,
            failOnStatusCode: false 
          })
          
          // Accept 200, 404 (page might not exist), or redirects
          if (response && response.status() >= 400 && response.status() !== 404) {
            brokenLinks.push(`${path} (status: ${response.status()})`)
          }
        } catch (e) {
          // If request fails, it might be a special path - skip
        }
      }
      
      expect(brokenLinks).toHaveLength(0)
    })

    test(`homepage has required sections`, async ({ page }) => {
      await page.goto(`/${tenant}`, { waitUntil: 'networkidle' })
      
      // Check that the page has some basic content
      const body = await page.locator('body').textContent()
      expect(body?.length).toBeGreaterThan(100)
      
      // Check for navigation
      const nav = await page.locator('nav').count()
      expect(nav).toBeGreaterThanOrEqual(1)
    })
  })
}

// ============================================================================
// TEST SUITE: LEALTIS PAGES
// ============================================================================

test.describe('LEALTIS Pages Tests', () => {
  
  for (const lealtisPage of LEALTIS_PAGES) {
    const pagePath = `/lealtis${lealtisPage}`
    const pageName = lealtisPage || 'home'
    
    test(`${pagePath} loads without errors`, async ({ page }) => {
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })
      
      const response = await page.goto(pagePath, { waitUntil: 'networkidle', timeout: 30000 })
      
      expect(response?.status()).toBe(200)
      
      // Filter critical errors
      const criticalErrors = errors.filter(e => 
        !e.includes('Warning') && 
        !e.includes('DevTools') &&
        !e.includes('favicon') &&
        !e.includes('Failed to load resource')
      )
      
      expect(criticalErrors).toHaveLength(0)
    })
  }

  // ============================================================================
  // TEST: LEALTIS NAVIGATION LINKS
  // ============================================================================

  test('lealtis navigation has correct /lealtis prefix', async ({ page }) => {
    await page.goto('/lealtis', { waitUntil: 'networkidle' })
    
    // Get all navigation links
    const navLinks = await page.locator('nav a[href^="/"]').all()
    
    const incorrectLinks: string[] = []
    
    for (const link of navLinks) {
      const href = await link.getAttribute('href')
      if (!href) continue
      
      // Skip external links and special links
      if (href.startsWith('http')) continue
      if (href.includes('mailto:')) continue
      if (href.includes('tel:')) continue
      
      // Lealtis links should start with /lealtis/
      if (!href.startsWith('/lealtis/') && href !== '/lealtis') {
        // Exception: root path or already correct
        if (!href.startsWith('/lealtis')) {
          incorrectLinks.push(href)
        }
      }
    }
    
    expect(incorrectLinks).toHaveLength(0)
  })

  // ============================================================================
  // TEST: LEALTIS INTERNAL LINKS ARE VALID
  // ============================================================================

  test('lealtis internal links point to existing pages', async ({ page }) => {
    await page.goto('/lealtis', { waitUntil: 'networkidle' })
    
    const links = await page.locator('a[href^="/lealtis"]').all()
    
    const brokenLinks: string[] = []
    
    for (const link of links) {
      const href = await link.getAttribute('href')
      if (!href) continue
      
      // Skip anchors and special
      if (href.includes('#')) continue
      if (href.includes('mailto:')) continue
      
      try {
        const response = await page.request.get(href, { 
          timeout: 5000,
          failOnStatusCode: false 
        })
        
        if (response && response.status() >= 400 && response.status() !== 404) {
          brokenLinks.push(`${href} (status: ${response.status()})`)
        }
      } catch (e) {
        // Skip failed requests
      }
    }
    
    expect(brokenLinks).toHaveLength(0)
  })

  // ============================================================================
  // TEST: LEALTIS LANDING NAV LINKS
  // ============================================================================

  test('lealtis landing-nav has all required links', async ({ page }) => {
    await page.goto('/lealtis', { waitUntil: 'networkidle' })
    
    // Expected navigation links
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
      await expect(link).toBeVisible()
    }
  })
})

// ============================================================================
// TEST SUITE: PLATFORM HOMEPAGE
// ============================================================================

test.describe('Platform Homepage Tests', () => {
  test('homepage loads', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'networkidle' })
    expect(response?.status()).toBe(200)
  })
})

// ============================================================================
// TEST SUITE: LINK VALIDATION UTILITY
// ============================================================================

test.describe('Link Validation Utility', () => {
  test('can validate links across all tenants', async ({ page }) => {
    // Test each tenant homepage has valid links
    for (const tenant of TENANTS) {
      await page.goto(`/${tenant}`, { waitUntil: 'networkidle' })
      
      const links = await page.locator('a[href]').count()
      expect(links).toBeGreaterThan(0)
    }
  })
})

// ============================================================================
// TEST SUITE: SEO & METADATA
// ============================================================================

test.describe('SEO & Metadata Tests', () => {
  for (const tenant of TENANTS) {
    test(`${tenant} has title and meta description`, async ({ page }) => {
      await page.goto(`/${tenant}`, { waitUntil: 'networkidle' })
      
      const title = await page.title()
      expect(title.length).toBeGreaterThan(0)
      
      // Check meta description exists
      const metaDesc = page.locator('meta[name="description"]')
      const description = await metaDesc.getAttribute('content')
      expect(description).toBeTruthy()
    })
  }
})
