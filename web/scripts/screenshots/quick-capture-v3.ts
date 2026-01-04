/**
 * Quick Screenshot Capture v3
 *
 * Keeps the same page instance to maintain session cookies.
 * Run with: npx tsx scripts/screenshots/quick-capture-v3.ts
 */

import { chromium, Page } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

const CONFIG = {
  baseUrl: 'http://localhost:3000',
  tenant: 'adris',
  outputDir: './screenshots',
  viewport: { width: 1920, height: 1080 },
}

const CREDENTIALS = {
  owner: { email: 'owner@adris.demo', password: 'demo123' },
  vet: { email: 'vet@adris.demo', password: 'demo123' },
  admin: { email: 'admin@adris.demo', password: 'demo123' },
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function getTimestamp(): string {
  return new Date().toISOString().split('T')[0]
}

async function capture(page: Page, name: string, pagePath: string, outputDir: string): Promise<boolean> {
  const url = `${CONFIG.baseUrl}/${CONFIG.tenant}${pagePath}`
  const outputPath = path.join(outputDir, `${name}.png`)

  process.stdout.write(`  📄 ${name}... `)

  try {
    ensureDir(outputDir)
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })

    // Wait a bit for client-side rendering
    await page.waitForTimeout(2000)

    // Check if redirected to login
    if (page.url().includes('/login') && !pagePath.includes('/login')) {
      console.log('⚠️ (redirected to login)')
      return false
    }

    await page.screenshot({ path: outputPath, fullPage: true })
    console.log('✓')
    return true
  } catch (error) {
    console.log('✗', (error as Error).message?.slice(0, 40))
    return false
  }
}

async function login(page: Page, email: string, password: string): Promise<boolean> {
  try {
    await page.goto(`${CONFIG.baseUrl}/${CONFIG.tenant}/portal/login`, { waitUntil: 'domcontentloaded' })

    // Wait and fill form
    await page.waitForSelector('input#email', { timeout: 10000 })
    await page.fill('input#email', email)
    await page.fill('input#password', password)

    // Submit using the email login button (not Google button)
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/auth') || resp.status() !== 0).catch(() => {}),
      page.click('button:has-text("Iniciar Sesión")')
    ])

    // Wait for auth to complete
    await page.waitForTimeout(3000)

    // Verify not on login page anymore
    const currentUrl = page.url()
    if (currentUrl.includes('/login')) {
      const errorText = await page.locator('[role="alert"]').textContent().catch(() => null)
      if (errorText) console.log(`    ⚠️ Error: ${errorText}`)
      return false
    }

    return true
  } catch (error) {
    console.error(`    Login error: ${(error as Error).message}`)
    return false
  }
}

async function main(): Promise<void> {
  const timestamp = getTimestamp()
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: CONFIG.viewport })
  const page = await context.newPage()

  console.log('═'.repeat(60))
  console.log('📸 SCREENSHOT CAPTURE v3')
  console.log('═'.repeat(60))
  console.log(`\nOutput: ${CONFIG.outputDir}/${timestamp}\n`)

  let success = 0, failed = 0

  try {
    // ========================================
    // PUBLIC PAGES
    // ========================================
    console.log('👤 PUBLIC PAGES')
    console.log('─'.repeat(40))

    const publicDir = path.join(CONFIG.outputDir, timestamp, CONFIG.tenant, 'desktop', 'public')
    const publicPages = [
      ['homepage', '/'],
      ['services', '/services'],
      ['store', '/store'],
      ['book', '/book'],
      ['faq', '/faq'],
      ['login', '/portal/login'],
      ['diagnosis-codes', '/diagnosis_codes'],
      ['drug-dosages', '/drug_dosages'],
    ]

    for (const [name, pagePath] of publicPages) {
      if (await capture(page, name, pagePath, publicDir)) success++
      else failed++
    }

    // ========================================
    // OWNER PORTAL
    // ========================================
    console.log('\n👤 OWNER PAGES')
    console.log('─'.repeat(40))
    console.log(`  🔐 Logging in as ${CREDENTIALS.owner.email}...`)

    if (await login(page, CREDENTIALS.owner.email, CREDENTIALS.owner.password)) {
      console.log('  ✓ Logged in\n')

      const ownerDir = path.join(CONFIG.outputDir, timestamp, CONFIG.tenant, 'desktop', 'owner')
      const ownerPages = [
        ['portal-dashboard', '/portal/dashboard'],
        ['portal-pets', '/portal/pets'],
        ['portal-appointments', '/portal/appointments'],
        ['portal-schedule', '/portal/schedule'],
        ['portal-messages', '/portal/messages'],
        ['portal-profile', '/portal/profile'],
      ]

      for (const [name, pagePath] of ownerPages) {
        if (await capture(page, name, pagePath, ownerDir)) success++
        else failed++
      }
    } else {
      console.log('  ✗ Login failed\n')
      failed += 6
    }

    // Logout
    await page.goto(`${CONFIG.baseUrl}/${CONFIG.tenant}/portal/logout`, { waitUntil: 'networkidle' }).catch(() => {})

    // ========================================
    // VET DASHBOARD
    // ========================================
    console.log('\n👤 VET PAGES')
    console.log('─'.repeat(40))
    console.log(`  🔐 Logging in as ${CREDENTIALS.vet.email}...`)

    if (await login(page, CREDENTIALS.vet.email, CREDENTIALS.vet.password)) {
      console.log('  ✓ Logged in\n')

      const vetDir = path.join(CONFIG.outputDir, timestamp, CONFIG.tenant, 'desktop', 'vet')
      const vetPages = [
        ['dashboard-home', '/dashboard'],
        ['dashboard-appointments', '/dashboard/appointments'],
        ['dashboard-patients', '/dashboard/patients'],
        ['dashboard-calendar', '/dashboard/calendar'],
        ['dashboard-inventory', '/dashboard/inventory'],
        ['dashboard-invoices', '/dashboard/invoices'],
        ['dashboard-hospital', '/dashboard/hospital'],
        ['dashboard-lab', '/dashboard/lab'],
      ]

      for (const [name, pagePath] of vetPages) {
        if (await capture(page, name, pagePath, vetDir)) success++
        else failed++
      }
    } else {
      console.log('  ✗ Login failed\n')
      failed += 8
    }

    // Logout
    await page.goto(`${CONFIG.baseUrl}/${CONFIG.tenant}/portal/logout`, { waitUntil: 'networkidle' }).catch(() => {})

    // ========================================
    // ADMIN DASHBOARD
    // ========================================
    console.log('\n👤 ADMIN PAGES')
    console.log('─'.repeat(40))
    console.log(`  🔐 Logging in as ${CREDENTIALS.admin.email}...`)

    if (await login(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password)) {
      console.log('  ✓ Logged in\n')

      const adminDir = path.join(CONFIG.outputDir, timestamp, CONFIG.tenant, 'desktop', 'admin')
      const adminPages = [
        ['dashboard-team', '/dashboard/team'],
        ['dashboard-analytics', '/dashboard/analytics'],
        ['dashboard-settings', '/dashboard/settings'],
        ['dashboard-audit', '/dashboard/audit'],
      ]

      for (const [name, pagePath] of adminPages) {
        if (await capture(page, name, pagePath, adminDir)) success++
        else failed++
      }
    } else {
      console.log('  ✗ Login failed\n')
      failed += 4
    }

  } finally {
    await browser.close()
  }

  // Summary
  console.log('\n' + '═'.repeat(60))
  console.log('📊 SUMMARY')
  console.log('═'.repeat(60))
  console.log(`
  ✓ Successful: ${success}
  ✗ Failed:     ${failed}
  Total:        ${success + failed}

  Output: ${path.resolve(CONFIG.outputDir, timestamp)}
`)
}

main().catch(console.error)
