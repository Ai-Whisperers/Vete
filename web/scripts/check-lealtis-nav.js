#!/usr/bin/env node
/**
 * Quick Lealtis Nav Link Checker
 * 
 * Run: node scripts/check-lealtis-nav.js
 * 
 * Checks if all navigation links in lealtis pages have the correct /lealtis prefix.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

const INCORRECT_PATTERNS = [
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

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    reset: '\x1b[0m',
  }
  console.log(`${colors[type] || colors.info}${message}${colors.reset}`)
}

async function checkLealtisNav() {
  log('\n🔍 Checking Lealtis Navigation Links\n', 'info')
  log('='.repeat(50), 'info')
  
  try {
    const response = await fetch(`${BASE_URL}/lealtis`, {
      method: 'GET',
      headers: {
        'User-Agent': 'NavChecker/1.0',
      },
    })
    
    if (response.status !== 200) {
      log(`❌ Failed to load /lealtis: HTTP ${response.status}`, 'error')
      process.exit(1)
    }
    
    const html = await response.text()
    
    // Find all href attributes
    const hrefRegex = /href="([^"]+)"/g
    const links = new Set()
    let match
    
    while ((match = hrefRegex.exec(html)) !== null) {
      links.add(match[1])
    }
    
    // Check for incorrect links
    const incorrectLinks = []
    
    for (const href of links) {
      // Skip external, anchors, mailto, tel
      if (href.startsWith('http')) continue
      if (href.startsWith('#')) continue
      if (href.startsWith('mailto:')) continue
      if (href.startsWith('tel:')) continue
      
      // Check if it's an incorrect pattern
      for (const pattern of INCORRECT_PATTERNS) {
        if (href === pattern || href.startsWith(pattern + '/')) {
          incorrectLinks.push(href)
          break
        }
      }
    }
    
    if (incorrectLinks.length > 0) {
      log(`\n❌ Found ${incorrectLinks.length} INCORRECT links:\n`, 'error')
      for (const link of incorrectLinks) {
        log(`   - ${link}`, 'error')
      }
      log('\n❌ VALIDATION FAILED\n', 'error')
      process.exit(1)
    } else {
      log('\n✅ All navigation links are CORRECT!', 'success')
      log('   All links properly use /lealtis/ prefix', 'success')
      log('\n✅ VALIDATION PASSED\n', 'success')
      process.exit(0)
    }
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'error')
    process.exit(1)
  }
}

checkLealtisNav()
