import React from 'react';
import { Bar } from 'react-chartjs-2';

const IncreaseByPropertyGraph = ({ data }) => {
  const chartData = {
    labels: data.map(row => row.Property),
    datasets: [
      {
        label: 'Standard Increase',
        data: data.map(row => row['Standard Increase'] * 100), // Convert to percentage
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h2>Increase by Property</h2>
      <Bar data={chartData} />
    </div>
  );
};

export default IncreaseByPropertyGraph;
