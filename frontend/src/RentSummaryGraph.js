import React from 'react';
import { Line } from 'react-chartjs-2';

function RentSummaryGraph({ chartData }) {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'category',
              ticks: {
                font: {
                  size: 12,
                },
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                font: {
                  size: 12,
                },
              },
            },
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
            title: {
              display: true,
              text: 'Rent Summary',
            },
          },
        }}
      />
    </div>
  );
}

export default RentSummaryGraph;






// import React, { useEffect, useRef } from 'react';
// import { Line } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

// function RentSummaryGraph({ chartData }) {
//   const chartRef = useRef(null);

//   useEffect(() => {
//     return () => {
//       if (chartRef.current) {
//         chartRef.current.destroy();
//       }
//     };
//   }, []);

//   const safeChartData = chartData && chartData.datasets ? chartData : { labels: [], datasets: [] };

//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//       x: {
//         type: 'category',
//         ticks: { font: { size: 10 } },
//       },
//       y: {
//         ticks: { font: { size: 10 } },
//       },
//     },
//     plugins: {
//       title: {
//         display: true,
//         text: 'Rent Summary',
//       },
//     },
//   };

//   return (
//     <div style={{ height: '250px', width: '100%' }}>
//       <Line ref={chartRef} data={safeChartData} options={options} />
//     </div>
//   );
// }

// export default RentSummaryGraph;
