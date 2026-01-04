/**
 * Complete Screenshot Capture
 *
 * Features:
 * - Waits for complete page load (skeleton loaders, spinners)
 * - Expands all collapsible sections (accordions, dropdowns, sidebar menus)
 * - Captures full page screenshots
 * - Supports multiple user roles
 *
 * Run with: npx tsx scripts/screenshots/capture-complete.ts
 */

import { chromium, Page, BrowserContext } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

const CONFIG = {
  baseUrl: 'http://localhost:3000',
  tenant: 'adris',
  outputDir: './screenshots',
  viewport: { width: 1920, height: 1080 },
  loadTimeout: 60000,
  renderDelay: 3000,
}

const CREDENTIALS = {
  owner: { email: 'owner@adris.demo', password: 'demo123', name: 'owner' },
  vet: { email: 'vet@adris.demo', password: 'demo123', name: 'vet' },
  admin: { email: 'admin@adris.demo', password: 'demo123', name: 'admin' },
}

// All pages to capture organized by role
const PAGES = {
  public: [
    { name: 'homepage', path: '/' },
    { name: 'services', path: '/services' },
    { name: 'store', path: '/store' },
    { name: 'book', path: '/book' },
    { name: 'faq', path: '/faq' },
    { name: 'login', path: '/portal/login' },
    { name: 'diagnosis-codes', path: '/diagnosis_codes' },
    { name: 'drug-dosages', path: '/drug_dosages' },
    { name: 'growth-charts', path: '/growth_charts' },
    { name: 'age-calculator', path: '/tools/age_calculator' },
    { name: 'toxic-foods', path: '/tools/toxic_checker' },
  ],
  owner: [
    { name: 'portal-dashboard', path: '/portal/dashboard' },
    { name: 'portal-pets', path: '/portal/pets' },
    { name: 'portal-appointments', path: '/portal/appointments' },
    { name: 'portal-schedule', path: '/portal/schedule' },
    { name: 'portal-messages', path: '/portal/messages' },
    { name: 'portal-profile', path: '/portal/profile' },
    { name: 'portal-loyalty', path: '/portal/loyalty' },
  ],
  vet: [
    { name: 'dashboard-home', path: '/dashboard' },
    { name: 'dashboard-appointments', path: '/dashboard/appointments' },
    { name: 'dashboard-calendar', path: '/dashboard/calendar' },
    { name: 'dashboard-patients', path: '/dashboard/patients' },
    { name: 'dashboard-clients', path: '/dashboard/clients' },
    { name: 'dashboard-inventory', path: '/dashboard/inventory' },
    { name: 'dashboard-invoices', path: '/dashboard/invoices' },
    { name: 'dashboard-hospital', path: '/dashboard/hospital' },
    { name: 'dashboard-lab', path: '/dashboard/lab' },
    { name: 'dashboard-vaccines', path: '/dashboard/vaccines' },
    { name: 'dashboard-consents', path: '/dashboard/consents' },
  ],
  admin: [
    { name: 'dashboard-team', path: '/dashboard/team' },
    { name: 'dashboard-analytics', path: '/dashboard/analytics' },
    { name: 'dashboard-settings', path: '/dashboard/settings' },
    { name: 'dashboard-audit', path: '/dashboard/audit' },
    { name: 'dashboard-campaigns', path: '/dashboard/campaigns' },
    { name: 'dashboard-coupons', path: '/dashboard/coupons' },
  ],
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function getTimestamp(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Wait for page to be fully loaded
 * - Waits for network idle
 * - Waits for loading indicators to disappear
 * - Waits for skeleton loaders to disappear
 */
async function waitForPageLoad(page: Page): Promise<void> {
  // Wait for basic network idle
  await page.waitForLoadState('domcontentloaded')

  // Wait for loading spinners to disappear
  const loadingSelectors = [
    '[class*="loading"]',
    '[class*="spinner"]',
    '[class*="skeleton"]',
    '[data-loading="true"]',
    '.animate-pulse',
    '[role="progressbar"]',
  ]

  for (const selector of loadingSelectors) {
    try {
      await page.waitForSelector(selector, { state: 'hidden', timeout: 5000 })
    } catch {
      // Selector not found or already hidden, continue
    }
  }

  // Wait for images to load
  await page.evaluate(() => {
    return Promise.all(
      Array.from(document.images)
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise((resolve) => {
              img.onload = img.onerror = resolve
            })
        )
    )
  })

  // Additional delay for React/Next.js hydration and data fetching
  await page.waitForTimeout(CONFIG.renderDelay)
}

/**
 * Expand all collapsible elements on the page
 * - Sidebar menu sections
 * - Accordion panels
 * - Dropdown menus
 * - Collapsible cards
 */
async function expandAllCollapsibles(page: Page): Promise<void> {
  // Common expand button/trigger selectors
  const expandSelectors = [
    // Sidebar navigation collapse buttons (data attributes)
    '[data-state="closed"]',
    '[aria-expanded="false"]',
    // Accordion triggers
    '[data-accordion-trigger]',
    'button[aria-controls]',
    // Shadcn/Radix collapsible
    '[data-radix-collection-item][data-state="closed"]',
    // Common expand icons/buttons
    'button:has(svg[class*="chevron-down"])',
    'button:has(svg[class*="chevron-right"])',
    // Sidebar sections that might be collapsed
    '.sidebar button[aria-expanded="false"]',
    'nav button[aria-expanded="false"]',
  ]

  for (const selector of expandSelectors) {
    try {
      const elements = await page.locator(selector).all()
      for (const element of elements) {
        const isVisible = await element.isVisible().catch(() => false)
        if (isVisible) {
          await element.click().catch(() => {})
          await page.waitForTimeout(200) // Small delay between clicks
        }
      }
    } catch {
      // Selector not found, continue
    }
  }

  // Specifically expand sidebar menu sections
  try {
    const sidebarButtons = await page.locator('aside button, nav button, [class*="sidebar"] button').all()
    for (const btn of sidebarButtons) {
      const expanded = await btn.getAttribute('aria-expanded')
      if (expanded === 'false') {
        await btn.click().catch(() => {})
        await page.waitForTimeout(200)
      }
    }
  } catch {
    // No sidebar buttons, continue
  }

  // Wait for any animations to complete
  await page.waitForTimeout(500)
}

/**
 * Login with email/password - simplified and robust
 */
async function login(page: Page, email: string, password: string): Promise<boolean> {
  try {
    // Navigate to login page
    await page.goto(`${CONFIG.baseUrl}/${CONFIG.tenant}/portal/login`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.loadTimeout,
    })

    // Wait for form to be fully loaded
    await page.waitForSelector('input#email', { timeout: 15000 })
    await page.waitForTimeout(1000)

    // Fill credentials slowly to ensure stability
    await page.fill('input#email', email)
    await page.waitForTimeout(500)
    await page.fill('input#password', password)
    await page.waitForTimeout(500)

    // Click the email login button
    await page.click('button:has-text("Iniciar Sesión")')

    // Wait longer for auth to complete (Supabase can be slow)
    await page.waitForTimeout(8000)

    // Check if we're still on login page
    const currentUrl = page.url()
    if (currentUrl.includes('/login')) {
      const errorText = await page.locator('[role="alert"]').textContent().catch(() => null)
      if (errorText) console.log(`      ⚠️ ${errorText.slice(0, 40)}`)
      return false
    }

    // Verify auth cookie exists
    const cookies = await page.context().cookies()
    const hasAuth = cookies.some(c => c.name.includes('auth-token'))
    if (!hasAuth) {
      console.log('      ⚠️ No auth cookie')
      return false
    }

    return true
  } catch (error) {
    console.log(`      ❌ ${(error as Error).message.slice(0, 50)}`)
    return false
  }
}

/**
 * Capture a single page screenshot
 */
async function capturePage(
  page: Page,
  pageDef: { name: string; path: string },
  outputDir: string
): Promise<boolean> {
  const url = `${CONFIG.baseUrl}/${CONFIG.tenant}${pageDef.path}`
  const outputPath = path.join(outputDir, `${pageDef.name}.png`)

  process.stdout.write(`    📄 ${pageDef.name}... `)

  try {
    ensureDir(outputDir)

    // Navigate to page
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: CONFIG.loadTimeout,
    })

    // Check for redirect to login
    if (page.url().includes('/login') && !pageDef.path.includes('/login')) {
      console.log('⚠️ (auth redirect)')
      return false
    }

    // Wait for complete load
    await waitForPageLoad(page)

    // Expand all collapsible sections
    await expandAllCollapsibles(page)

    // Additional wait after expansions
    await page.waitForTimeout(1000)

    // Capture screenshot
    await page.screenshot({ path: outputPath, fullPage: true })
    console.log('✓')
    return true
  } catch (error) {
    console.log(`✗ ${(error as Error).message.slice(0, 40)}`)
    return false
  }
}

/**
 * Capture all pages for a role
 */
async function captureRole(
  context: BrowserContext,
  role: string,
  pages: { name: string; path: string }[],
  outputDir: string,
  credentials?: { email: string; password: string }
): Promise<{ success: number; failed: number }> {
  const stats = { success: 0, failed: 0 }
  const page = await context.newPage()

  // Login if credentials provided
  if (credentials) {
    console.log(`    🔐 Logging in as ${credentials.email}...`)
    const loggedIn = await login(page, credentials.email, credentials.password)
    if (!loggedIn) {
      console.log('    ❌ Login failed, skipping role\n')
      await page.close()
      return { success: 0, failed: pages.length }
    }
    console.log('    ✓ Logged in\n')
  }

  // Capture each page
  for (const pageDef of pages) {
    const success = await capturePage(page, pageDef, outputDir)
    if (success) stats.success++
    else stats.failed++
  }

  await page.close()
  return stats
}

async function main(): Promise<void> {
  const timestamp = getTimestamp()
  const browser = await chromium.launch({ headless: true })

  console.log('═'.repeat(60))
  console.log('📸 COMPLETE SCREENSHOT CAPTURE')
  console.log('═'.repeat(60))
  console.log(`\nOutput: ${CONFIG.outputDir}/${timestamp}`)
  console.log(`Tenant: ${CONFIG.tenant}`)
  console.log(`Features: Full load wait + Expand collapsibles\n`)

  let totalSuccess = 0
  let totalFailed = 0

  try {
    // ========================================
    // PUBLIC PAGES
    // ========================================
    console.log('👤 PUBLIC PAGES (no auth)')
    console.log('─'.repeat(40))

    const publicContext = await browser.newContext({ viewport: CONFIG.viewport })
    const publicDir = path.join(CONFIG.outputDir, timestamp, CONFIG.tenant, 'desktop', 'public')
    const publicStats = await captureRole(publicContext, 'public', PAGES.public, publicDir)
    totalSuccess += publicStats.success
    totalFailed += publicStats.failed
    await publicContext.close()

    // ========================================
    // OWNER PAGES
    // ========================================
    console.log('\n👤 OWNER PAGES')
    console.log('─'.repeat(40))

    const ownerContext = await browser.newContext({ viewport: CONFIG.viewport })
    const ownerDir = path.join(CONFIG.outputDir, timestamp, CONFIG.tenant, 'desktop', 'owner')
    const ownerStats = await captureRole(ownerContext, 'owner', PAGES.owner, ownerDir, CREDENTIALS.owner)
    totalSuccess += ownerStats.success
    totalFailed += ownerStats.failed
    await ownerContext.close()

    // ========================================
    // VET PAGES
    // ========================================
    console.log('\n👤 VET PAGES')
    console.log('─'.repeat(40))

    const vetContext = await browser.newContext({ viewport: CONFIG.viewport })
    const vetDir = path.join(CONFIG.outputDir, timestamp, CONFIG.tenant, 'desktop', 'vet')
    const vetStats = await captureRole(vetContext, 'vet', PAGES.vet, vetDir, CREDENTIALS.vet)
    totalSuccess += vetStats.success
    totalFailed += vetStats.failed
    await vetContext.close()

    // ========================================
    // ADMIN PAGES
    // ========================================
    console.log('\n👤 ADMIN PAGES')
    console.log('─'.repeat(40))

    const adminContext = await browser.newContext({ viewport: CONFIG.viewport })
    const adminDir = path.join(CONFIG.outputDir, timestamp, CONFIG.tenant, 'desktop', 'admin')
    const adminStats = await captureRole(adminContext, 'admin', PAGES.admin, adminDir, CREDENTIALS.admin)
    totalSuccess += adminStats.success
    totalFailed += adminStats.failed
    await adminContext.close()
  } finally {
    await browser.close()
  }

  // Summary
  console.log('\n' + '═'.repeat(60))
  console.log('📊 SUMMARY')
  console.log('═'.repeat(60))
  console.log(`
  ✓ Successful: ${totalSuccess}
  ✗ Failed:     ${totalFailed}
  Total:        ${totalSuccess + totalFailed}

  Output: ${path.resolve(CONFIG.outputDir, timestamp)}
`)
}

main().catch(console.error)
