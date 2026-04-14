/**
 * Mobile Responsive Audit Script
 * 
 * Run this script to audit all pages for mobile responsiveness.
 * This is a critical usability check to ensure a good user experience on mobile devices.
 * 
 * Usage: npx tsx scripts/audit-mobile-responsive.ts
 * 
 * Output: List of pages with mobile responsiveness issues
 */

import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

interface AuditFinding {
  file: string
  issue: string
  severity: 'critical' | 'high' | 'medium'
}

const findings: AuditFinding[] = []

async function auditMobileResponsive() {
  const pagesDir = path.join(process.cwd(), 'app', 'page')
  const pageFiles = await glob('**/*.tsx', { cwd: pagesDir })

  for (const file of pageFiles) {
    const fullPath = path.join(pagesDir, file)
    const content = fs.readFileSync(fullPath, 'utf-8')

    // Check for mobile-specific meta tags
    if (!content.includes('<meta name="viewport"')) {
      findings.push({
        file: fullPath,
        issue: 'Missing viewport meta tag',
        severity: 'high',
      })
    }

    // Check for responsive layouts
    if (!content.includes('max-width') || !content.includes('flex')) {
      findings.push({
        file: fullPath,
        issue: 'Non-responsive layout',
        severity: 'medium',
      })
    }
  }

  console.log(findings)
}

auditMobileResponsive()