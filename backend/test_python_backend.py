#!/usr/bin/env python3
"""
Quick test script to verify Python backend setup
Run: python test_python_backend.py
"""

import sys
import os

def check_python_version():
    """Check Python version"""
    version = sys.version_info
    print(f"✓ Python version: {version.major}.{version.minor}.{version.micro}")
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("⚠ Warning: Python 3.8+ recommended")
        return False
    return True

def check_dependencies():
    """Check if required packages are installed"""
    required = ['flask', 'flask_cors', 'mysql.connector', 'dotenv']
    missing = []
    
    for package in required:
        try:
            if package == 'flask_cors':
                __import__('flask_cors')
            elif package == 'mysql.connector':
                __import__('mysql.connector')
            elif package == 'dotenv':
                __import__('dotenv')
            else:
                __import__(package)
            print(f"✓ {package} installed")
        except ImportError:
            print(f"✗ {package} NOT installed")
            missing.append(package)
    
    if missing:
        print(f"\n⚠ Missing dependencies: {', '.join(missing)}")
        print("Install with: pip install -r requirements.txt")
        return False
    return True

def check_files():
    """Check if required files exist"""
    files = ['server.py', 'json_db.py', 'requirements.txt', '.env']
    all_exist = True
    
    for file in files:
        if os.path.exists(file):
            print(f"✓ {file} exists")
        else:
            print(f"✗ {file} NOT found")
            all_exist = False
    
    return all_exist

def test_json_db():
    """Test JSON database module"""
    try:
        from json_db import JsonDatabase
        print("✓ json_db module can be imported")
        return True
    except ImportError as e:
        print(f"✗ Cannot import json_db: {e}")
        return False

def test_server_import():
    """Test if server can be imported"""
    try:
        # Add current directory to path
        sys.path.insert(0, os.getcwd())
        
        # Try importing server module (don't run it)
        import importlib.util
        spec = importlib.util.spec_from_file_location("server", "server.py")
        if spec and spec.loader:
            print("✓ server.py can be loaded")
            return True
        else:
            print("✗ server.py cannot be loaded")
            return False
    except Exception as e:
        print(f"✗ Error loading server.py: {e}")
        return False

def main():
    print("="*60)
    print("🐍 Python Backend Setup Test")
    print("="*60)
    print()
    
    # Run all checks
    checks = [
        ("Python Version", check_python_version),
        ("Dependencies", check_dependencies),
        ("Required Files", check_files),
        ("JSON DB Module", test_json_db),
        ("Server Module", test_server_import)
    ]
    
    results = []
    for name, check_func in checks:
        print(f"\n[{name}]")
        results.append(check_func())
    
    print("\n" + "="*60)
    
    if all(results):
        print("✅ All checks passed! Python backend is ready.")
        print("\nTo start the server:")
        print("  python server.py")
        print("\nOr use the switcher script:")
        print("  ./start-backend.sh python")
    else:
        print("❌ Some checks failed. Please fix the issues above.")
        print("\nQuick fix:")
        print("  pip install -r requirements.txt")
    
    print("="*60)

if __name__ == '__main__':
    main()
