#!/usr/bin/env node

/**
 * Logo Generator Script
 * This script generates the app logo in multiple sizes for PWA and favicon use
 * 
 * Usage: node scripts/generate-logo.js
 * 
 * Requirements: npm install sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgLogo = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Background Circle -->
  <circle cx="100" cy="100" r="95" fill="#0f0f0f" stroke="#ff6347" stroke-width="2"/>
  
  <!-- Gradient Definition -->
  <defs>
    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff6347;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ff8570;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="checkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#66BB6A;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Center Circle (Progress Ring) -->
  <circle cx="100" cy="100" r="75" fill="none" stroke="url(#logoGradient)" stroke-width="3" opacity="0.3"/>
  
  <!-- Upward Arrow (Progress) -->
  <g transform="translate(100, 100)">
    <!-- Arrow stem -->
    <line x1="0" y1="35" x2="0" y2="-20" stroke="url(#logoGradient)" stroke-width="4" stroke-linecap="round"/>
    
    <!-- Arrow head -->
    <polygon points="0,-20 -10,-5 10,-5" fill="url(#logoGradient)"/>
    
    <!-- Checkmark for completed habit -->
    <g transform="translate(-35, 0)">
      <circle cx="0" cy="0" r="22" fill="#1e1e1e" stroke="url(#checkGradient)" stroke-width="2.5"/>
      <polyline points="-8,0 -2,6 8,-4" fill="none" stroke="url(#checkGradient)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    
    <!-- Star for achievement -->
    <g transform="translate(35, -10)">
      <circle cx="0" cy="0" r="20" fill="#1e1e1e" stroke="url(#logoGradient)" stroke-width="2.5"/>
      <!-- Star points -->
      <polygon points="0,-8 2,-2 8,-2 3,2 5,8 0,4 -5,8 -3,2 -8,-2 -2,-2" fill="url(#logoGradient)"/>
    </g>
  </g>
  
  <!-- Subtle background circles for visual interest -->
  <circle cx="100" cy="100" r="60" fill="none" stroke="#ff6347" stroke-width="1" opacity="0.1"/>
  <circle cx="100" cy="100" r="45" fill="none" stroke="#ff6347" stroke-width="1" opacity="0.1"/>
</svg>`;

const sizes = [
  { size: 32, name: 'favicon-32x32.png' },
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

const publicDir = path.join(__dirname, '../public');

async function generateLogos() {
  console.log('🎨 Generating app logos...\n');

  for (const { size, name } of sizes) {
    try {
      await sharp(Buffer.from(svgLogo))
        .png()
        .resize(size, size, {
          fit: 'contain',
          background: { r: 15, g: 15, b: 15, alpha: 1 },
        })
        .toFile(path.join(publicDir, name));

      console.log(`✅ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error.message);
    }
  }

  // Also generate favicon.ico from the 32x32 PNG
  try {
    await sharp(path.join(publicDir, 'favicon-32x32.png'))
      .toFile(path.join(publicDir, 'favicon.ico'));

    console.log('✅ Generated favicon.ico');
  } catch (error) {
    console.error('❌ Failed to generate favicon.ico:', error.message);
  }

  console.log('\n✨ Logo generation complete!');
}

generateLogos();
