import React from 'react';
import { Line } from 'react-chartjs-2';

const RentSummaryGraph = ({ chartData }) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h2>Rent Summary</h2>
      <Line data={chartData} />
    </div>
  );
};

export default RentSummaryGraph;
