#!/usr/bin/env node
/**
 * Image Placeholder Generator
 * Run: node scripts/generate-image-placeholders.js
 */

const fs = require('fs');
const path = require('path');

const tenants = ['arasy', 'clinica-duerksen', 'dayah', 'fun4me', 'granja-cabral', 'petlife', 'stroopwafel-huis', 'terrapet', 'cavillpet'];
const brandingDir = path.join(__dirname, '../public/branding');

const tenantColors = {
  arasy: '#1B3A6B',
  clinica-duerksen: '#00838F',
  dayah: '#4527A0',
  fun4me: '#C62828',
  granja-cabral: '#6D4C41',
  petlife: '#1565C0',
  stroopwafel-huis: '#E65100',
  terrapet: '#2D6A4F',
  cavillpet: '#1B6B3A',
};

const templates = {
  hero: (name, color) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
  <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${color};stop-opacity:1" /><stop offset="100%" style="stop-color:${color};stop-opacity:0.7" /></linearGradient></defs>
  <rect width="1920" height="1080" fill="url(#bg)"/>
  <text x="960" y="500" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" opacity="0.5">${name}</text>
  <text x="960" y="570" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" opacity="0.3">Replace with 1920x1080 JPG</text>
</svg>`,
  heroMobile: (name, color) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200">
  <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${color};stop-opacity:1" /><stop offset="100%" style="stop-color:${color};stop-opacity:0.7" /></linearGradient></defs>
  <rect width="800" height="1200" fill="url(#bg)"/>
  <text x="400" y="550" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle" opacity="0.5">${name}</text>
  <text x="400" y="600" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" opacity="0.3">Replace with 800x1200 JPG</text>
</svg>`,
  about: (name, color) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 800">
  <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${color};stop-opacity:1" /><stop offset="100%" style="stop-color:${color};stop-opacity:0.6" /></linearGradient></defs>
  <rect width="1920" height="800" fill="url(#bg)"/>
  <text x="960" y="380" font-family="Arial, sans-serif" font-size="40" fill="white" text-anchor="middle" opacity="0.5">${name} - About</text>
</svg>`,
  og: (name, color) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${color};stop-opacity:1" /><stop offset="100%" style="stop-color:${color};stop-opacity:0.7" /></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="600" y="280" font-family="Georgia, serif" font-size="56" fill="white" text-anchor="middle" font-weight="bold">${name}</text>
  <text x="600" y="350" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" opacity="0.8">Your Tagline Here</text>
  <text x="600" y="550" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" opacity="0.5">Replace with 1200x630 JPG</text>
</svg>`,
};

console.log('🎨 Generating placeholder images...\n');

tenants.forEach((tenant) => {
  const tenantDir = path.join(brandingDir, tenant, 'images');
  if (!fs.existsSync(tenantDir)) fs.mkdirSync(tenantDir, { recursive: true });

  const color = tenantColors[tenant] || '#1B3A6B';
  const displayName = tenant.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  console.log(`📁 ${tenant}...`);
  fs.writeFileSync(path.join(tenantDir, 'hero-bg.jpg'), templates.hero(displayName, color));
  fs.writeFileSync(path.join(tenantDir, 'hero-bg-mobile.jpg'), templates.heroMobile(displayName, color));
  fs.writeFileSync(path.join(tenantDir, 'about-hero.jpg'), templates.about(displayName, color));
  fs.writeFileSync(path.join(tenantDir, 'og-image.jpg'), templates.og(displayName, color));
  console.log('  ✅ All placeholders created');
});

console.log('\n✅ Done! Replace placeholder SVGs with real JPG images.');
