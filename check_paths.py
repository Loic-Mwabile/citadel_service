import os
import re
from pathlib import Path

# Project root directory
PROJECT_ROOT = Path(__file__).parent.absolute()

# Files to check
FILES_TO_CHECK = [
    'index.html',
    'offline.html',
    'sw.js',
    'manifest.json'
]

def find_file(file_path):
    """Check if file exists in the project."""
    # Check if path is absolute
    if os.path.isabs(file_path):
        return os.path.exists(file_path)
    
    # Check relative to project root
    full_path = PROJECT_ROOT / file_path
    if full_path.exists():
        return True
    
    # Check in src directory (legacy)
    src_path = PROJECT_ROOT / 'src' / file_path
    return src_path.exists()

def check_html_file(file_path):
    """Check all links in an HTML file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all href, src, and content attributes
    patterns = [
        r'(?:href|src|content)="([^"]+)"',
        r'url\(["\']?([^"\')]+)["\']?\)',
        r'@import\s+["\']([^"\']+)["\']',
    ]
    
    issues = []
    for pattern in patterns:
        for match in re.finditer(pattern, content):
            url = match.group(1)
            # Skip external URLs and data URIs
            if url.startswith(('http://', 'https://', 'data:', '#')):
                continue
            
            # Clean up the URL
            url = url.split('?')[0].split('#')[0]
            if not find_file(url):
                issues.append(f"  - Broken link: {url}")
    
    return issues

def check_js_file(file_path):
    """Check all file paths in a JS file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all string literals that look like file paths
    pattern = r'["\'](?!https?://)([^"\'?]+\.[a-zA-Z0-9]+)["\']'
    issues = []
    
    for match in re.finditer(pattern, content):
        url = match.group(1)
        if not find_file(url):
            # Skip common false positives
            if any(skip in url for skip in ['console.', 'fetch', 'XMLHttpRequest', 'new Image']):
                continue
            issues.append(f"  - Broken reference: {url}")
    
    return issues

def main():
    print("Checking file paths in project...\n")
    has_issues = False
    
    for file_name in FILES_TO_CHECK:
        file_path = PROJECT_ROOT / file_name
        if not file_path.exists():
            print(f"⚠️ File not found: {file_name}")
            has_issues = True
            continue
            
        print(f"🔍 Checking {file_name}...")
        issues = []
        
        if file_name.endswith('.html'):
            issues = check_html_file(file_path)
        elif file_name.endswith('.js'):
            issues = check_js_file(file_path)
        elif file_name == 'manifest.json':
            # We'll check manifest paths separately
            continue
            
        if issues:
            print("\n".join(issues))
            has_issues = True
        else:
            print("  ✓ No issues found")
    
    # Check manifest.json separately
    manifest_path = PROJECT_ROOT / 'manifest.json'
    if manifest_path.exists():
        print("\n🔍 Checking manifest.json...")
        with open(manifest_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find all file paths in manifest
        pattern = r'"([^"]+\.(?:png|jpg|jpeg|gif|svg|webp|ico))"'
        issues = []
        
        for match in re.finditer(pattern, content):
            url = match.group(1)
            if not find_file(url):
                issues.append(f"  - Missing file: {url}")
        
        if issues:
            print("\n".join(issues))
            has_issues = True
        else:
            print("  ✓ No issues found in manifest.json")
    
    if not has_issues:
        print("\n✅ All file paths are correct!")
    else:
        print("\n❌ Some issues were found. Please fix the above paths.")

if __name__ == "__main__":
    main()
