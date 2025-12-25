#!/usr/bin/env python3
"""Convert EXECUTIVE_SUMMARY.html to PDF using Chrome/Chromium"""

import sys
import json
import subprocess
from pathlib import Path

# Define paths
html_path = Path('docs/EXECUTIVE_SUMMARY.html').absolute()
pdf_path = Path('docs/EXECUTIVE_SUMMARY.pdf').absolute()

if not html_path.exists():
    print(f"❌ Error: {html_path} not found")
    sys.exit(1)

# Try multiple Chrome locations on Windows
chrome_paths = [
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files\Chromium\Application\chrome.exe',
]

chrome_exe = None
for path in chrome_paths:
    if Path(path).exists():
        chrome_exe = path
        break

if not chrome_exe:
    print("❌ Chrome/Chromium not found. Trying Edge...")
    edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    if Path(edge_path).exists():
        chrome_exe = edge_path

if not chrome_exe:
    print("❌ No compatible browser found (Chrome/Edge required)")
    print("📋 Alternative: You can manually print the HTML file to PDF:")
    print(f"   1. Open {html_path} in a web browser")
    print(f"   2. Press Ctrl+P to print")
    print(f"   3. Change printer to 'Print to PDF'")
    print(f"   4. Save as: {pdf_path}")
    sys.exit(1)

try:
    print(f"Using browser: {chrome_exe}")
    print(f"Converting {html_path.name} to PDF...")
    
    # Use Chrome's headless mode to print to PDF
    cmd = [
        chrome_exe,
        '--headless=new',
        '--disable-gpu',
        f'--print-to-pdf={pdf_path}',
        str(html_path)
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    
    if result.returncode == 0 and pdf_path.exists():
        size_mb = pdf_path.stat().st_size / (1024 * 1024)
        print(f"✅ PDF created successfully!")
        print(f"📄 Location: {pdf_path}")
        print(f"📊 Size: {size_mb:.2f} MB")
    else:
        print(f"⚠️  Conversion may have failed")
        if result.stderr:
            print(f"Errors: {result.stderr[:500]}")
        if pdf_path.exists():
            print(f"✅ PDF file exists at {pdf_path}")
            
except subprocess.TimeoutExpired:
    print("❌ Conversion timeout")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
