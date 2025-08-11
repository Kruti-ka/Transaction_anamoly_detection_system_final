import React from 'react';
import NetworkVisualization from '../components/NetworkVisualization';

const NetworkPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Transaction Network</h1>
      <NetworkVisualization />
    </div>
  );
};

export default NetworkPage;