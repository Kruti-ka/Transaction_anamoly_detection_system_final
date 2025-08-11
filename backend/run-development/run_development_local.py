#!/usr/bin/env python3
"""
Local development runner script (without Docker)
This script helps manage the development workflow using local PostgreSQL and Redis
"""

import os
import sys
import subprocess
import time
import signal
import platform
from pathlib import Path

class LocalDevelopmentRunner:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.processes = []
        self.system = platform.system().lower()
        
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
            
        # Check PostgreSQL
        try:
            result = subprocess.run(["psql", "--version"], capture_output=True, text=True)
            print(f"✅ PostgreSQL: {result.stdout.strip()}")
        except:
            print("❌ PostgreSQL not found. Please install PostgreSQL.")
            return False
            
        # Check Redis
        try:
            result = subprocess.run(["redis-cli", "--version"], capture_output=True, text=True)
            print(f"✅ Redis: {result.stdout.strip()}")
        except:
            print("❌ Redis not found. Please install Redis.")
            return False
            
        # Check if virtual environment exists
        venv_path = self.project_root / "fraud_detection_env"
        if venv_path.exists():
            print("✅ Virtual environment found")
        else:
            print("❌ Virtual environment not found")
            return False
            
        return True
    
    def start_postgresql(self):
        """Start PostgreSQL service"""
        print("🚀 Starting PostgreSQL...")
        
        try:
            if self.system == "darwin":  # macOS
                subprocess.run(["brew", "services", "start", "postgresql"], check=True)
            elif self.system == "linux":
                subprocess.run(["sudo", "systemctl", "start", "postgresql"], check=True)
            elif self.system == "windows":
                # On Windows, PostgreSQL usually runs as a service
                subprocess.run(["net", "start", "postgresql-x64-15"], shell=True)
            
            print("✅ PostgreSQL started")
            time.sleep(3)  # Wait for service to start
            
        except subprocess.CalledProcessError as e:
            print(f"⚠️  PostgreSQL might already be running or failed to start: {e}")
        
        # Test connection
        try:
            subprocess.run([
                "psql", "-U", "postgres", "-c", "SELECT 1;"
            ], check=True, capture_output=True, 
            env={**os.environ, "PGPASSWORD": "password"})
            print("✅ PostgreSQL connection verified")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to connect to PostgreSQL")
            return False
    
    def start_redis(self):
        """Start Redis service"""
        print("🚀 Starting Redis...")
        
        try:
            if self.system == "darwin":  # macOS
                subprocess.run(["brew", "services", "start", "redis"], check=True)
            elif self.system == "linux":
                subprocess.run(["sudo", "systemctl", "start", "redis-server"], check=True)
            elif self.system == "windows":
                # On Windows, start redis-server directly
                process = subprocess.Popen(["redis-server"], 
                                         creationflags=subprocess.CREATE_NEW_CONSOLE)
                self.processes.append(("Redis Server", process))
            
            print("✅ Redis started")
            time.sleep(2)  # Wait for service to start
            
        except subprocess.CalledProcessError as e:
            print(f"⚠️  Redis might already be running or failed to start: {e}")
        
        # Test connection
        try:
            result = subprocess.run(["redis-cli", "ping"], 
                                  capture_output=True, text=True, check=True)
            if "PONG" in result.stdout:
                print("✅ Redis connection verified")
                return True
        except subprocess.CalledProcessError:
            print("❌ Failed to connect to Redis")
            return False
        
        return True
    
    def create_database(self):
        """Create the transaction database"""
        print("📊 Creating database...")
        
        try:
            # Try to create database
            subprocess.run([
                "createdb", "-U", "postgres", "transaction_db"
            ], check=True, capture_output=True,
            env={**os.environ, "PGPASSWORD": "password"})
            print("✅ Database created")
            
        except subprocess.CalledProcessError:
            print("⚠️  Database might already exist")
        
        return True
    
    def setup_database_schema(self):
        """Setup database schema"""
        print("📊 Setting up database schema...")
        
        try:
            subprocess.run([
                "psql", "-U", "postgres", "-d", "transaction_db",
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
        
        print("🚀 Starting Transaction Fraud Detection System (Local Setup)")
        print("=" * 70)
        
        try:
            # Check prerequisites
            if not self.check_prerequisites():
                print("❌ Prerequisites check failed")
                return False
            
            # Start services
            if not self.start_postgresql():
                print("❌ PostgreSQL startup failed")
                return False
                
            if not self.start_redis():
                print("❌ Redis startup failed")
                return False
            
            # Setup database
            if not self.create_database():
                print("❌ Database creation failed")
                return False
                
            if not self.setup_database_schema():
                print("❌ Database schema setup failed")
                return False
            
            # Start API server
            if not self.start_api_server():
                print("❌ API server startup failed")
                return False
            
            print("\n" + "=" * 70)
            print("🎉 Local development environment is ready!")
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
        runner = LocalDevelopmentRunner()
        
        if command == "check":
            runner.check_prerequisites()
        elif command == "postgresql":
            runner.start_postgresql()
        elif command == "redis":
            runner.start_redis()
        elif command == "database":
            runner.create_database()
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
            print("Available commands: check, postgresql, redis, database, api, detect, analytics, full")
    else:
        # Default: run full setup
        runner = LocalDevelopmentRunner()
        runner.run_full_development_setup()

if __name__ == "__main__":
    main()
