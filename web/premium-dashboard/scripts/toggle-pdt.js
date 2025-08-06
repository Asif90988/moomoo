#!/usr/bin/env node

// Quick script to toggle PDT protection on/off
// Usage: 
//   node scripts/toggle-pdt.js off    # Disable PDT protection (for accounts >= $25K)
//   node scripts/toggle-pdt.js on     # Enable PDT protection (for accounts < $25K)
//   node scripts/toggle-pdt.js status # Show current status

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const action = process.argv[2];

function readEnvFile() {
  try {
    return fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    console.error('❌ Error reading .env.local file:', error.message);
    process.exit(1);
  }
}

function writeEnvFile(content) {
  try {
    fs.writeFileSync(envPath, content);
    console.log('✅ Updated .env.local file');
  } catch (error) {
    console.error('❌ Error writing .env.local file:', error.message);
    process.exit(1);
  }
}

function togglePDT(enable) {
  let content = readEnvFile();
  
  const newValue = enable ? 'true' : 'false';
  const regex = /NEXT_PUBLIC_PDT_PROTECTION_ENABLED=(true|false)/;
  
  if (regex.test(content)) {
    content = content.replace(regex, `NEXT_PUBLIC_PDT_PROTECTION_ENABLED=${newValue}`);
  } else {
    content += `\nNEXT_PUBLIC_PDT_PROTECTION_ENABLED=${newValue}\n`;
  }
  
  writeEnvFile(content);
  
  if (enable) {
    console.log('🛡️  PDT Protection ENABLED');
    console.log('   - Maximum 3 day trades per 5 business days');
    console.log('   - Same-day buy/sell orders will be blocked if limit reached');
    console.log('   - Suitable for accounts under $25,000');
  } else {
    console.log('🔓 PDT Protection DISABLED');
    console.log('   - Unlimited day trades allowed');
    console.log('   - ⚠️  Only use this for accounts with $25,000+ equity');
    console.log('   - ⚠️  Risk of PDT violation if account drops below $25K');
  }
  
  console.log('\n🔄 Restart the development server to apply changes');
}

function showStatus() {
  const content = readEnvFile();
  const match = content.match(/NEXT_PUBLIC_PDT_PROTECTION_ENABLED=(true|false)/);
  const enabled = match ? match[1] === 'true' : true; // Default to enabled
  
  console.log('📊 Current PDT Protection Status:');
  console.log(`   Status: ${enabled ? '🛡️  ENABLED' : '🔓 DISABLED'}`);
  
  if (enabled) {
    console.log('   - Maximum 3 day trades per 5 business days');
    console.log('   - Safe for accounts under $25,000');
  } else {
    console.log('   - Unlimited day trades allowed');
    console.log('   - ⚠️  Only safe for accounts with $25,000+ equity');
  }
}

// Main logic
switch (action) {
  case 'off':
  case 'disable':
  case 'false':
    console.log('💰 Assuming account has $25,000+ equity...');
    togglePDT(false);
    break;
    
  case 'on':
  case 'enable':
  case 'true':
    console.log('🛡️  Enabling PDT protection for account safety...');
    togglePDT(true);
    break;
    
  case 'status':
  case 'check':
    showStatus();
    break;
    
  default:
    console.log('📚 PDT Protection Toggle Script');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/toggle-pdt.js off     # Disable PDT protection (accounts >= $25K)');
    console.log('  node scripts/toggle-pdt.js on      # Enable PDT protection (accounts < $25K)');
    console.log('  node scripts/toggle-pdt.js status  # Show current status');
    console.log('');
    console.log('🚨 PDT Rule Summary:');
    console.log('   - Accounts under $25,000 are limited to 3 day trades per 5 business days');
    console.log('   - Day trade = buy and sell same stock on same day');
    console.log('   - Violating PDT rule can result in 90-day trading restrictions');
    console.log('');
    console.log('💡 When to disable PDT protection:');
    console.log('   - Your account equity is consistently above $25,000');
    console.log('   - You want unlimited day trading capability');
    console.log('');
    console.log('🛡️  When to enable PDT protection:');
    console.log('   - Your account equity is below $25,000');
    console.log('   - You want to prevent accidental PDT violations');
    process.exit(1);
}

console.log('\n💡 Remember: You can always check your current day trade count in the trading dashboard');