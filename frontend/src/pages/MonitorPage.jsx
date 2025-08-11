import React from 'react';
import TransactionMonitor from '../components/TransactionMonitor';

const MonitorPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Real-Time Transaction Monitor</h1>
      <TransactionMonitor />
    </div>
  );
};

export default MonitorPage;