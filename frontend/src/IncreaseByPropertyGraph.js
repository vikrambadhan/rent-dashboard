import React, { useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function IncreaseByPropertyGraph({ data }) {
  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const labels = data.map(row => row.Property);
  const dataset = data.map(row => row['Standard Increase'] * 100);

  const safeChartData = {
    labels: labels || [],
    datasets: [
      {
        label: 'Standard Increase (%)',
        data: dataset || [],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'category',
        ticks: { font: { size: 10 } },
      },
      y: {
        ticks: { font: { size: 10 } },
      },
    },
    plugins: {
      title: {
        display: true,
        text: 'Increase by Property',
      },
    },
  };

  return (
    <div style={{ height: '250px', width: '100%' }}>
      <Bar ref={chartRef} data={safeChartData} options={options} />
    </div>
  );
}

export default IncreaseByPropertyGraph;
