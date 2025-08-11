#!/usr/bin/env python3
"""
Development runner script for the Transaction Fraud Detection System
This script helps manage the development workflow
"""

import os
import sys
import subprocess
import time
import signal
from pathlib import Path

class DevelopmentRunner:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.processes = []
        
    def check_prerequisites(self):
        """Check if all prerequisites are installed"""
        print("🔍 Checking prerequisites...")
        
        # Check Python
        try:
            result = subprocess.run([sys.executable, "--version"], capture_output=True, text=True)
            print(f"✅ Python: {result.stdout.strip()}")
        except:
            print("❌ Python not found")
            return False
            
        # Check Docker
        try:
            result = subprocess.run(["docker", "--version"], capture_output=True, text=True)
            print(f"✅ Docker: {result.stdout.strip()}")
        except:
            print("❌ Docker not found")
            return False
            
        # Check if virtual environment exists
        venv_path = self.project_root / "fraud_detection_env"
        if venv_path.exists():
            print("✅ Virtual environment found")
        else:
            print("❌ Virtual environment not found")
            return False
            
        return True
    
    def start_database(self):
        """Start PostgreSQL and Redis using Docker"""
        print("🚀 Starting database services...")
        
        try:
            subprocess.run([
                "docker-compose", "up", "-d", "postgres", "redis"
            ], cwd=self.project_root, check=True)
            print("✅ Database services started")
            
            # Wait for services to be ready
            print("⏳ Waiting for services to be ready...")
            time.sleep(10)
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to start database services: {e}")
            return False
            
        return True
    
    def setup_database_schema(self):
        """Setup database schema"""
        print("📊 Setting up database schema...")
        
        try:
            subprocess.run([
                "psql", "-h", "localhost", "-U", "postgres", "-d", "transaction_db",
                "-f", "scripts/01-create-database.sql"
            ], cwd=self.project_root, check=True, 
            env={**os.environ, "PGPASSWORD": "password"})
            print("✅ Database schema created")
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to setup database schema: {e}")
            return False
            
        return True
    
    def start_api_server(self):
        """Start the FastAPI server"""
        print("🌐 Starting API server...")
        
        try:
            process = subprocess.Popen([
                sys.executable, "scripts/api_server.py"
            ], cwd=self.project_root)
            
            self.processes.append(("API Server", process))
            print("✅ API server started on http://localhost:8000")
            
        except Exception as e:
            print(f"❌ Failed to start API server: {e}")
            return False
            
        return True
    
    def run_anomaly_detection(self):
        """Run anomaly detection"""
        print("🔍 Running anomaly detection...")
        
        try:
            subprocess.run([
                sys.executable, "scripts/anomaly_detector.py"
            ], cwd=self.project_root, check=True)
            print("✅ Anomaly detection completed")
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Anomaly detection failed: {e}")
            return False
            
        return True
    
    def generate_analytics(self):
        """Generate analytics report"""
        print("📈 Generating analytics report...")
        
        try:
            subprocess.run([
                sys.executable, "scripts/kaggle_analytics.py"
            ], cwd=self.project_root, check=True)
            print("✅ Analytics report generated")
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Analytics generation failed: {e}")
            return False
            
        return True
    
    def cleanup(self):
        """Cleanup running processes"""
        print("\n🧹 Cleaning up...")
        
        for name, process in self.processes:
            if process.poll() is None:
                print(f"Stopping {name}...")
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
    
    def signal_handler(self, signum, frame):
        """Handle interrupt signals"""
        print("\n🛑 Received interrupt signal")
        self.cleanup()
        sys.exit(0)
    
    def run_full_development_setup(self):
        """Run the complete development setup"""
        # Register signal handlers
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
        print("🚀 Starting Transaction Fraud Detection System Development Setup")
        print("=" * 70)
        
        try:
            # Check prerequisites
            if not self.check_prerequisites():
                print("❌ Prerequisites check failed")
                return False
            
            # Start database
            if not self.start_database():
                print("❌ Database startup failed")
                return False
            
            # Setup database schema
            if not self.setup_database_schema():
                print("❌ Database schema setup failed")
                return False
            
            # Start API server
            if not self.start_api_server():
                print("❌ API server startup failed")
                return False
            
            print("\n" + "=" * 70)
            print("🎉 Development environment is ready!")
            print("📊 API Documentation: http://localhost:8000/docs")
            print("🔍 Health Check: http://localhost:8000/health")
            print("📈 Analytics: Run 'python scripts/kaggle_analytics.py'")
            print("🛑 Press Ctrl+C to stop all services")
            print("=" * 70)
            
            # Keep the script running
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                pass
                
        except Exception as e:
            print(f"❌ Setup failed: {e}")
            return False
        finally:
            self.cleanup()
        
        return True

def main():
    """Main function"""
    if len(sys.argv) > 1:
        command = sys.argv[1]
        runner = DevelopmentRunner()
        
        if command == "check":
            runner.check_prerequisites()
        elif command == "database":
            runner.start_database()
        elif command == "schema":
            runner.setup_database_schema()
        elif command == "api":
            runner.start_api_server()
        elif command == "detect":
            runner.run_anomaly_detection()
        elif command == "analytics":
            runner.generate_analytics()
        elif command == "full":
            runner.run_full_development_setup()
        else:
            print("Available commands: check, database, schema, api, detect, analytics, full")
    else:
        # Default: run full setup
        runner = DevelopmentRunner()
        runner.run_full_development_setup()

if __name__ == "__main__":
    main()
