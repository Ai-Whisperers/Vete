#!/usr/bin/env node
/**
 * Quick Link Validator Script
 * 
 * Run: node scripts/validate-links.js
 * 
 * This script validates all internal links across all tenants and lealtis pages.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// ============================================================================
// CONFIGURATION
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
]

// ============================================================================
// UTILITIES
// ============================================================================

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warn: '\x1b[33m',
    reset: '\x1b[0m',
  }
  console.log(`${colors[type] || colors.info}${message}${colors.reset}`)
}

function extractLinks(html, basePath) {
  const linkRegex = /href="([^"]+)"/g
  const links = []
  let match
  
  while ((match = linkRegex.exec(html)) !== null) {
    let href = match[1]
    
    // Skip external links, anchors, mailto, tel
    if (href.startsWith('http') && !href.includes('localhost')) continue
    if (href.startsWith('#')) continue
    if (href.startsWith('mailto:')) continue
    if (href.startsWith('tel:')) continue
    
    // Resolve relative links
    if (href.startsWith('/')) {
      links.push(href)
    }
  }
  
  return [...new Set(links)] // Remove duplicates
}

function isLealtisLinkIncorrect(href) {
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
  ]
  
  return incorrectPatterns.some(pattern => 
    href === pattern || href.startsWith(pattern + '/')
  )
}

// ============================================================================
// MAIN VALIDATION
// ============================================================================

async function validatePage(baseUrl, path) {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'LinkValidator/1.0',
      },
    })
    
    const html = await response.text()
    const status = response.status
    
    return {
      status,
      html: status === 200 ? html : null,
      error: status !== 200 ? `HTTP ${status}` : null,
    }
  } catch (error) {
    return {
      status: 0,
      html: null,
      error: error.message,
    }
  }
}

async function runValidation() {
  log('\n🔗 Link Validation Report\n', 'info')
  log('=' .repeat(60), 'info')
  
  let totalErrors = 0
  let totalWarnings = 0
  
  // ===========================================================================
  // VALIDATE LEALTIS PAGES
  // ===========================================================================
  
  log('\n📄 LEALTIS PAGES\n', 'info')
  log('-'.repeat(40), 'info')
  
  for (const page of LEALTIS_PAGES) {
    const path = `/lealtis${page}`
    process.stdout.write(`  Checking ${path}... `)
    
    const result = await validatePage(BASE_URL, path)
    
    if (result.error) {
      log(`❌ ${result.error}`, 'error')
      totalErrors++
      continue
    }
    
    if (result.status !== 200) {
      log(`❌ HTTP ${result.status}`, 'error')
      totalErrors++
      continue
    }
    
    log(`✅ OK`, 'success')
  }
  
  // ===========================================================================
  // VALIDATE LEALTIS NAVIGATION LINKS
  // ===========================================================================
  
  log('\n🔍 LEALTIS NAVIGATION LINK CHECK\n', 'info')
  log('-'.repeat(40), 'info')
  
  const homeResult = await validatePage(BASE_URL, '/lealtis')
  
  if (homeResult.html) {
    const links = extractLinks(homeResult.html, '/lealtis')
    const incorrectLinks = links.filter(isLealtisLinkIncorrect)
    
    if (incorrectLinks.length > 0) {
      log(`\n  ❌ Found ${incorrectLinks.length} incorrect links:`, 'error')
      for (const link of incorrectLinks) {
        log(`     - ${link}`, 'error')
      }
      totalErrors += incorrectLinks.length
    } else {
      log(`  ✅ All navigation links are correct`, 'success')
    }
  }
  
  // ===========================================================================
  // VALIDATE TENANT PAGES
  // ===========================================================================
  
  log('\n🏥 TENANT PAGES\n', 'info')
  log('-'.repeat(40), 'info')
  
  for (const tenant of TENANTS) {
    process.stdout.write(`  Checking /${tenant}... `)
    
    const result = await validatePage(BASE_URL, `/${tenant}`)
    
    if (result.error) {
      log(`❌ ${result.error}`, 'error')
      totalErrors++
      continue
    }
    
    if (result.status !== 200) {
      log(`❌ HTTP ${result.status}`, 'error')
      totalErrors++
      continue
    }
    
    // Check for incorrect links (no /lealtis prefix)
    if (result.html) {
      const links = extractLinks(result.html, `/${tenant}`)
      const incorrectLinks = links.filter(href => 
        href.startsWith('/lealtis') && !href.startsWith('/lealtis/')
      )
      
      if (incorrectLinks.length > 0) {
        log(`⚠️ ${incorrectLinks.length} link issues`, 'warn')
        totalWarnings += incorrectLinks.length
      } else {
        log(`✅ OK`, 'success')
      }
    } else {
      log(`✅ OK`, 'success')
    }
  }
  
  // ===========================================================================
  // SUMMARY
  // ===========================================================================
  
  log('\n' + '='.repeat(60), 'info')
  log('📊 SUMMARY\n', 'info')
  log('-'.repeat(40), 'info')
  log(`  Total Lealtis Pages: ${LEALTIS_PAGES.length}`, 'info')
  log(`  Total Tenants: ${TENANTS.length}`, 'info')
  log(`  Errors: ${totalErrors}`, totalErrors > 0 ? 'error' : 'success')
  log(`  Warnings: ${totalWarnings}`, totalWarnings > 0 ? 'warn' : 'success')
  
  if (totalErrors > 0) {
    log('\n❌ VALIDATION FAILED\n', 'error')
    process.exit(1)
  } else {
    log('\n✅ ALL VALIDATIONS PASSED\n', 'success')
    process.exit(0)
  }
}

// ============================================================================
// RUN
// ============================================================================

runValidation().catch(error => {
  log(`\n❌ Fatal error: ${error.message}\n`, 'error')
  process.exit(1)
})
