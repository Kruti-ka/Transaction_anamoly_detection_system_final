-- Create database schema for transaction network system
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users/Accounts table
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_number VARCHAR(50) UNIQUE NOT NULL,
    account_type VARCHAR(20) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_suspicious BOOLEAN DEFAULT FALSE,
    risk_score DECIMAL(5,2) DEFAULT 0
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_account_id UUID REFERENCES accounts(id),
    to_account_id UUID REFERENCES accounts(id),
    amount DECIMAL(15,2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    is_anomaly BOOLEAN DEFAULT FALSE,
    anomaly_score DECIMAL(5,2) DEFAULT 0,
    anomaly_reasons TEXT[]
);

-- Anomaly detection results
CREATE TABLE anomaly_detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id),
    detection_method VARCHAR(100) NOT NULL,
    anomaly_score DECIMAL(5,2) NOT NULL,
    confidence DECIMAL(5,2) NOT NULL,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending'
);

-- Create indexes for performance
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX idx_transactions_from_account ON transactions(from_account_id);
CREATE INDEX idx_transactions_to_account ON transactions(to_account_id);
CREATE INDEX idx_transactions_anomaly ON transactions(is_anomaly);
CREATE INDEX idx_accounts_suspicious ON accounts(is_suspicious);
