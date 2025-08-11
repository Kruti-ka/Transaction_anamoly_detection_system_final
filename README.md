# Transaction Anomaly Detection System

A comprehensive fraud detection system that uses machine learning, statistical analysis, and network analysis to identify suspicious transactions in real-time.

## 🏗️ Architecture

- **Backend**: FastAPI with PostgreSQL, Redis, and ML models
- **Frontend**: React with Tailwind CSS and real-time WebSocket updates
- **ML Models**: Isolation Forest, Random Forest, and ensemble methods
- **Network Analysis**: Graph-based anomaly detection using NetworkX

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Redis (optional)

### Backend Setup

1. **Create Virtual Environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Database Setup**
   ```bash
   # Create database and run migrations
   psql -U postgres -c "CREATE DATABASE transaction_db;"
   psql -U postgres -d transaction_db -f 01-create-database.sql
   ```

4. **Environment Configuration**
   ```bash
   # Copy and edit environment file
   cp env.example .env
   # Edit .env with your database credentials
   ```

5. **Start Backend Server**
   ```bash
   python api_server.py
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_NAME=transaction_db
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
DB_PORT=5432

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000

# Security
SECRET_KEY=your_secret_key_here
DEBUG=False
```

## 📊 Features

- **Real-time Monitoring**: WebSocket-based live updates
- **ML-powered Detection**: Multiple anomaly detection algorithms
- **Network Analysis**: Graph-based fraud pattern detection
- **Dashboard**: Comprehensive analytics and metrics
- **Alert System**: Real-time fraud alerts and notifications

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Production Considerations
- Use environment variables for all sensitive data
- Enable HTTPS in production
- Set up proper logging and monitoring
- Use production-grade database and Redis instances
- Implement rate limiting and authentication

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🔒 Security Features

- Parameterized SQL queries (SQL injection protection)
- CORS configuration
- Input validation and sanitization
- Error message sanitization
- Secure database connections

## 📈 Performance Optimizations

- Database connection pooling
- Query optimization with proper indexes
- WebSocket connection management
- Efficient ML model inference
- Caching strategies

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check PostgreSQL service is running
   - Verify database credentials in `.env`
   - Ensure database exists and migrations are applied

2. **Frontend Build Errors**
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Verify all dependencies are properly installed

3. **ML Model Errors**
   - Ensure all Python dependencies are installed
   - Check data format and preprocessing
   - Verify model file paths

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request



