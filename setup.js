const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('ecom-connector Setup Script');
console.log('='.repeat(60));
console.log('');

// Step 1: Create directories
console.log('Step 1: Creating directory structure...');
const dirs = [
  'src',
  'src/platforms',
  'src/platforms/zalooa',
  'src/platforms/tiktokshop',
  'src/platforms/shopee',
  'src/platforms/lazada',
  'examples',
  'dist'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  ✓ Created ${dir}/`);
  } else {
    console.log(`  ✓ ${dir}/ already exists`);
  }
});

console.log('');
console.log('Step 2: Creating .env.example file...');

const envExample = `# Shopee Configuration
SHOPEE_PARTNER_ID=your_partner_id_here
SHOPEE_PARTNER_KEY=your_partner_key_here
SHOPEE_SHOP_ID=your_shop_id_here
SHOPEE_ACCESS_TOKEN=your_access_token_here

# TikTok Shop Configuration
TIKTOK_APP_KEY=your_app_key_here
TIKTOK_APP_SECRET=your_app_secret_here
TIKTOK_SHOP_ID=your_shop_id_here
TIKTOK_ACCESS_TOKEN=your_access_token_here

# Zalo OA Configuration
ZALO_APP_ID=your_app_id_here
ZALO_SECRET_KEY=your_secret_key_here
ZALO_ACCESS_TOKEN=your_access_token_here

# Lazada Configuration
LAZADA_APP_KEY=your_app_key_here
LAZADA_APP_SECRET=your_app_secret_here
LAZADA_ACCESS_TOKEN=your_access_token_here
`;

fs.writeFileSync('.env.example', envExample);
console.log('  ✓ Created .env.example');

if (!fs.existsSync('.env')) {
  fs.writeFileSync('.env', envExample);
  console.log('  ✓ Created .env (please edit with your actual credentials)');
} else {
  console.log('  ⚠ .env already exists, not overwriting');
}

console.log('');
console.log('='.repeat(60));
console.log('Directory structure created successfully!');
console.log('='.repeat(60));
console.log('');
console.log('Next steps:');
console.log('  1. Copy source code from SOURCE_CODE.md and SOURCE_CODE_PART2.md');
console.log('     to their respective files in src/ directory');
console.log('  2. Edit .env file with your actual API credentials');
console.log('  3. Run: npm install');
console.log('  4. Run: npm run build');
console.log('  5. Run: node dist/examples/example.js');
console.log('');
console.log('For detailed instructions, see INSTALLATION_GUIDE.md');
console.log('');
