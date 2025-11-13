#!/usr/bin/env python3
"""
Auto-extract source files from documentation
This script parses SOURCE_CODE.md and SOURCE_CODE_PART2.md and creates all source files automatically
"""

import os
import re

def extract_code_blocks(markdown_file):
    """Extract code blocks from markdown file"""
    with open(markdown_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match: ## path/to/file.ts followed by ```typescript or ```javascript
    pattern = r'## ([\w/\.]+)\s*\n\s*```(?:typescript|javascript|env)\n(.*?)```'
    matches = re.findall(pattern, content, re.DOTALL)
    
    return matches

def create_file(filepath, content):
    """Create file with content, making directories as needed"""
    # Normalize path for Windows
    filepath = filepath.replace('/', os.sep)
    
    # Create directory if it doesn't exist
    directory = os.path.dirname(filepath)
    if directory and not os.path.exists(directory):
        os.makedirs(directory, exist_ok=True)
        print(f"  Created directory: {directory}")
    
    # Write file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  ✓ Created: {filepath}")

def main():
    print('=' * 60)
    print('ecom-connector Auto-Setup Script')
    print('=' * 60)
    print()
    
    # Check if documentation files exist
    if not os.path.exists('SOURCE_CODE.md'):
        print("Error: SOURCE_CODE.md not found!")
        return
    
    if not os.path.exists('SOURCE_CODE_PART2.md'):
        print("Error: SOURCE_CODE_PART2.md not found!")
        return
    
    print("Step 1: Extracting code from SOURCE_CODE.md...")
    files1 = extract_code_blocks('SOURCE_CODE.md')
    print(f"  Found {len(files1)} code blocks")
    
    print("\nStep 2: Extracting code from SOURCE_CODE_PART2.md...")
    files2 = extract_code_blocks('SOURCE_CODE_PART2.md')
    print(f"  Found {len(files2)} code blocks")
    
    all_files = files1 + files2
    
    print(f"\nStep 3: Creating {len(all_files)} files...")
    for filepath, content in all_files:
        try:
            create_file(filepath, content)
        except Exception as e:
            print(f"  ✗ Error creating {filepath}: {e}")
    
    print()
    print('=' * 60)
    print('Setup complete!')
    print('=' * 60)
    print()
    print('Next steps:')
    print('  1. Edit .env file with your actual API credentials')
    print('  2. Run: npm install')
    print('  3. Run: npm run build')
    print('  4. Run: node dist/examples/example.js')
    print()

if __name__ == '__main__':
    main()
