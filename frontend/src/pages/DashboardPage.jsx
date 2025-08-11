import React from 'react';
import AnomalyDashboard from '../components/AnomalyDashboard';

const DashboardPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Anomaly Detection Dashboard</h1>
      <AnomalyDashboard />
    </div>
  );
};

export default DashboardPage;