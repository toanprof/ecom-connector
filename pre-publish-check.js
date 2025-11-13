const fs = require('fs');
const path = require('path');

console.log('🔍 Pre-Publish Check\n');
console.log('='.repeat(60));

let hasErrors = false;
let hasWarnings = false;

// 1. Kiểm tra package.json
console.log('\n📦 Checking package.json...');
const pkg = require('./package.json');

if (pkg.author === '' || pkg.author.includes('Your Name')) {
  console.log('  ❌ ERROR: Please update "author" field in package.json');
  hasErrors = true;
} else {
  console.log('  ✓ Author: ' + pkg.author);
}

if (pkg.repository && pkg.repository.url.includes('yourusername')) {
  console.log('  ⚠️  WARNING: Please update repository URL in package.json');
  hasWarnings = true;
} else if (pkg.repository) {
  console.log('  ✓ Repository: ' + pkg.repository.url);
}

if (!pkg.version) {
  console.log('  ❌ ERROR: Missing version');
  hasErrors = true;
} else {
  console.log('  ✓ Version: ' + pkg.version);
}

console.log('  ✓ Name: ' + pkg.name);
console.log('  ✓ Description: ' + pkg.description.substring(0, 50) + '...');

// 2. Kiểm tra dist folder
console.log('\n📂 Checking dist folder...');
if (!fs.existsSync('./dist')) {
  console.log('  ❌ ERROR: dist/ folder not found. Run: npm run build');
  hasErrors = true;
} else {
  const distFiles = fs.readdirSync('./dist');
  if (distFiles.length === 0) {
    console.log('  ❌ ERROR: dist/ folder is empty. Run: npm run build');
    hasErrors = true;
  } else {
    console.log('  ✓ Found ' + distFiles.length + ' files in dist/');
    
    // Check key files
    const requiredFiles = ['index.js', 'index.d.ts', 'factory.js', 'interfaces.js'];
    requiredFiles.forEach(file => {
      if (fs.existsSync(path.join('./dist', file))) {
        console.log('    ✓ ' + file);
      } else {
        console.log('    ❌ Missing: ' + file);
        hasErrors = true;
      }
    });
  }
}

// 3. Kiểm tra README
console.log('\n📖 Checking documentation...');
if (!fs.existsSync('./README.md')) {
  console.log('  ❌ ERROR: README.md not found');
  hasErrors = true;
} else {
  const readmeSize = fs.statSync('./README.md').size;
  console.log('  ✓ README.md exists (' + (readmeSize / 1024).toFixed(1) + ' KB)');
}

if (!fs.existsSync('./LICENSE')) {
  console.log('  ⚠️  WARNING: LICENSE file not found');
  hasWarnings = true;
} else {
  const license = fs.readFileSync('./LICENSE', 'utf8');
  if (license.includes('[Your Name]')) {
    console.log('  ⚠️  WARNING: Update [Your Name] in LICENSE file');
    hasWarnings = true;
  } else {
    console.log('  ✓ LICENSE exists');
  }
}

// 4. Kiểm tra .env không bị commit
console.log('\n🔒 Checking security...');
if (fs.existsSync('./.env')) {
  const gitignore = fs.readFileSync('./.gitignore', 'utf8');
  if (!gitignore.includes('.env')) {
    console.log('  ❌ ERROR: .env file exists but not in .gitignore!');
    hasErrors = true;
  } else {
    console.log('  ✓ .env is properly ignored');
  }
}

const npmignore = fs.existsSync('./.npmignore');
if (!npmignore) {
  console.log('  ⚠️  WARNING: .npmignore not found');
  hasWarnings = true;
} else {
  console.log('  ✓ .npmignore exists');
}

// 5. Kiểm tra dependencies
console.log('\n📚 Checking dependencies...');
if (!pkg.dependencies || Object.keys(pkg.dependencies).length === 0) {
  console.log('  ⚠️  WARNING: No dependencies listed');
  hasWarnings = true;
} else {
  console.log('  ✓ Dependencies:');
  Object.keys(pkg.dependencies).forEach(dep => {
    console.log('    - ' + dep + ' ' + pkg.dependencies[dep]);
  });
}

// 6. Kiểm tra TypeScript types
console.log('\n🔷 Checking TypeScript...');
if (pkg.types || pkg.typings) {
  console.log('  ✓ Types: ' + (pkg.types || pkg.typings));
} else {
  console.log('  ⚠️  WARNING: No types field in package.json');
  hasWarnings = true;
}

// 7. Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Summary:\n');

if (hasErrors) {
  console.log('❌ FAILED - Please fix errors above before publishing\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  PASSED with warnings - Review warnings above\n');
  console.log('Continue? You can still publish, but consider fixing warnings.\n');
  process.exit(0);
} else {
  console.log('✅ ALL CHECKS PASSED - Ready to publish!\n');
  console.log('Next steps:');
  console.log('  1. npm login');
  console.log('  2. npm publish --access public');
  console.log('  3. git tag v' + pkg.version);
  console.log('  4. git push origin v' + pkg.version);
  console.log();
  process.exit(0);
}
