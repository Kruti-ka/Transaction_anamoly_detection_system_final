#!/usr/bin/env python3
"""
Script to run the frontend development server
"""

import subprocess
import sys
import os
import time
from pathlib import Path

def run_frontend():
    """Run the Next.js frontend development server"""
    
    # Get the project root directory
    project_root = Path(__file__).parent.parent
    frontend_dir = project_root / "app"
    
    print("🚀 Starting Transaction Anomaly Detection Frontend...")
    print(f"📁 Frontend directory: {frontend_dir}")
    
    # Check if we're in the right directory
    if not (frontend_dir / "page.jsx").exists():
        print("❌ Error: Could not find frontend files. Make sure you're in the project root.")
        return False
    
    try:
        # Change to the project root directory
        os.chdir(project_root)
        
        # Check if node_modules exists, if not install dependencies
        if not (project_root / "node_modules").exists():
            print("📦 Installing frontend dependencies...")
            subprocess.run(["npm", "install"], check=True)
        
        print("🌐 Starting development server on http://localhost:3000")
        print("📊 Backend API should be running on http://localhost:8000")
        print("🔗 The frontend will connect to the backend automatically")
        print("\n" + "="*60)
        
        # Start the development server
        subprocess.run(["npm", "run", "dev"], check=True)
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error running frontend: {e}")
        return False
    except KeyboardInterrupt:
        print("\n👋 Frontend server stopped by user")
        return True
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = run_frontend()
    sys.exit(0 if success else 1) 