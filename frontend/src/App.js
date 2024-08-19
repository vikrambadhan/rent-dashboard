import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import RentSummaryGraph from './RentSummaryGraph';
import IncreaseByPropertyGraph from './IncreaseByPropertyGraph';
import DashboardTiles from './DashboardTiles';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [driverData, setDriverData] = useState([]);
  const [averageStandardIncrease, setAverageStandardIncrease] = useState(0);
  const [averageProjectedRenewal, setAverageProjectedRenewal] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Rent Data',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        fill: false,
      },
    ],
  });

  useEffect(() => {
    fetchDriverData();
  }, []);

  const fetchDriverData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/driver-data');
      console.log('Driver data fetched:', response.data);
      setDriverData(response.data);
      calculateMetrics(response.data);
    } catch (error) {
      console.error("Error fetching driver data:", error);
    }
  };

  const calculateMetrics = (data) => {
    const totalStandardIncrease = data.reduce((total, row) => total + row['Standard Increase'], 0);
    const avgStandardIncrease = (totalStandardIncrease / data.length) * 100;
    setAverageStandardIncrease(avgStandardIncrease.toFixed(2));

    const validProjectedRenewals = data
      .filter(row => row['Projected Renewal'] && !isNaN(row['Projected Renewal']))
      .map(row => row['Projected Renewal']);
      
    const totalProjectedRenewal = validProjectedRenewals.reduce((total, renewal) => total + renewal, 0);
    const avgProjectedRenewal = totalProjectedRenewal / validProjectedRenewals.length;
    setAverageProjectedRenewal(avgProjectedRenewal.toFixed(2));
  };

  const handleInputChange = (index, event) => {
    const newData = [...driverData];
    newData[index]['Proposed Increase'] = parseFloat(event.target.value) / 100 || 0;

    const updatedDriverData = newData.map(row => {
      const increase = row['Proposed Increase'] !== undefined ? row['Proposed Increase'] : row['Standard Increase'];
      const baseRent = row['Base Rent'] !== undefined ? row['Base Rent'] : 1000; // Default value for testing

      if (baseRent && !isNaN(baseRent) && !isNaN(increase)) {
        row['Projected Renewal'] = baseRent * (1 + increase);
      } else {
        row['Projected Renewal'] = 'N/A';
      }

      return row;
    });

    setDriverData(updatedDriverData);
    calculateMetrics(updatedDriverData); // Recalculate metrics when data changes

    if (selectedProperty) {
      updateChart(selectedProperty, updatedDriverData);
    }
  };

  const handlePropertyClick = async (property) => {
    try {
      setSelectedProperty(property);
      updateChart(property, driverData);
    } catch (error) {
      console.error("Error handling property click:", error);
    }
  };

  const updateChart = async (property, data) => {
    try {
      const response = await axios.get(`http://localhost:5000/rent-summary/${property}`);
      const propertyData = response.data;

      const labels = ['Jan-24', 'Feb-24', 'Mar-24', 'Apr-24', 'May-24', 'Jun-24', 'Projected Renewal'];
      const rentData = [
        propertyData['Jan-24'],
        propertyData['Feb-24'],
        propertyData['Mar-24'],
        propertyData['Apr-24'],
        propertyData['May-24'],
        propertyData['Jun-24'],
      ];

      const selectedPropertyData = data.find(row => row.Property === property);
      if (selectedPropertyData) {
        const projectedRenewal = selectedPropertyData['Projected Renewal'];
        rentData.push(projectedRenewal);
      }

      setChartData({
        labels,
        datasets: [
          {
            label: `${property} Rent Data`,
            data: rentData.map(value => (value !== 'N/A' && !isNaN(value) ? value : null)),
            borderColor: 'rgb(75, 192, 192)',
            fill: false,
          },
        ],
      });

    } catch (error) {
      console.error("Error updating chart:", error);
    }
  };

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: '#4CAF50', padding: '10px', textAlign: 'center', color: 'white', fontSize: '24px' }}>
        Indus Renewal Dashboard
      </header>

      <DashboardTiles 
        averageStandardIncrease={averageStandardIncrease} 
        averageProjectedRenewal={averageProjectedRenewal} 
      />

      <div style={{ display: 'flex', flexDirection: 'row', marginTop: '20px' }}>
        <div style={{ flex: 1 }}>
          <h2>Driver Table</h2>
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Standard Increase</th>
                <th>Proposed Increase</th>
                <th>Projected Renewal</th>
              </tr>
            </thead>
            <tbody>
              {driverData.map((row, index) => (
                <tr key={index}>
                  <td
                    style={{ cursor: 'pointer', color: 'blue' }}
                    onClick={() => handlePropertyClick(row.Property)}
                  >
                    {row.Property}
                  </td>
                  <td>{(row['Standard Increase'] * 100).toFixed(2)}%</td>
                  <td>
                    <input
                      type="number"
                      value={(row['Proposed Increase'] * 100).toFixed(2) || ''}
                      onChange={e => handleInputChange(index, e)}
                    />
                    %
                  </td>
                  <td>{row['Projected Renewal'] !== 'N/A' && !isNaN(row['Projected Renewal']) 
                          ? row['Projected Renewal'].toFixed(2) 
                          : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, marginBottom: '20px' }}>
            <RentSummaryGraph chartData={chartData} />
          </div>
          <div style={{ flex: 1 }}>
            <IncreaseByPropertyGraph data={driverData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;





// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './App.css';
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
// import RentSummaryGraph from './RentSummaryGraph';
// import IncreaseByPropertyGraph from './IncreaseByPropertyGraph';
// import DashboardTiles from './DashboardTiles';  // Import the new DashboardTiles component

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

// function App() {
//   const [driverData, setDriverData] = useState([]);
//   const [averageStandardIncrease, setAverageStandardIncrease] = useState(0);
//   const [selectedProperty, setSelectedProperty] = useState(null);
//   const [chartData, setChartData] = useState({
//     labels: [],
//     datasets: [
//       {
//         label: 'Rent Data',
//         data: [],
//         borderColor: 'rgb(75, 192, 192)',
//         fill: false,
//       },
//     ],
//   });

//   useEffect(() => {
//     fetchDriverData();
//   }, []);

//   const fetchDriverData = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/driver-data');
//       console.log('Driver data fetched:', response.data);
//       setDriverData(response.data);
//       calculateMetrics(response.data);
//     } catch (error) {
//       console.error("Error fetching driver data:", error);
//     }
//   };

//   const calculateMetrics = (data) => {
//     const totalStandardIncrease = data.reduce((total, row) => total + row['Standard Increase'], 0);
//     const avgStandardIncrease = (totalStandardIncrease / data.length) * 100;
//     setAverageStandardIncrease(avgStandardIncrease.toFixed(2));
//   };

//   const handleInputChange = (index, event) => {
//     const newData = [...driverData];
//     newData[index]['Proposed Increase'] = parseFloat(event.target.value) / 100 || 0;

//     const updatedDriverData = newData.map(row => {
//       const increase = row['Proposed Increase'] !== undefined ? row['Proposed Increase'] : row['Standard Increase'];
//       const baseRent = row['Base Rent'] !== undefined ? row['Base Rent'] : 1000; // Default value for testing

//       if (baseRent && !isNaN(baseRent) && !isNaN(increase)) {
//         row['Projected Renewal'] = baseRent * (1 + increase);
//       } else {
//         row['Projected Renewal'] = 'N/A';
//       }

//       return row;
//     });

//     setDriverData(updatedDriverData);

//     if (selectedProperty) {
//       updateChart(selectedProperty, updatedDriverData);
//     }
//   };

//   const handlePropertyClick = async (property) => {
//     try {
//       setSelectedProperty(property);
//       updateChart(property, driverData);
//     } catch (error) {
//       console.error("Error handling property click:", error);
//     }
//   };

//   const updateChart = async (property, data) => {
//     try {
//       const response = await axios.get(`http://localhost:5000/rent-summary/${property}`);
//       const propertyData = response.data;

//       const labels = ['Jan-24', 'Feb-24', 'Mar-24', 'Apr-24', 'May-24', 'Jun-24', 'Projected Renewal'];
//       const rentData = [
//         propertyData['Jan-24'],
//         propertyData['Feb-24'],
//         propertyData['Mar-24'],
//         propertyData['Apr-24'],
//         propertyData['May-24'],
//         propertyData['Jun-24'],
//       ];

//       const selectedPropertyData = data.find(row => row.Property === property);
//       if (selectedPropertyData) {
//         const projectedRenewal = selectedPropertyData['Projected Renewal'];
//         rentData.push(projectedRenewal);
//       }

//       setChartData({
//         labels,
//         datasets: [
//           {
//             label: `${property} Rent Data`,
//             data: rentData.map(value => (value !== 'N/A' && !isNaN(value) ? value : null)),
//             borderColor: 'rgb(75, 192, 192)',
//             fill: false,
//           },
//         ],
//       });

//     } catch (error) {
//       console.error("Error updating chart:", error);
//     }
//   };

//   return (
//     <div className="App" style={{ display: 'flex', flexDirection: 'column' }}>
//       <header style={{ backgroundColor: '#4CAF50', padding: '10px', textAlign: 'center', color: 'white', fontSize: '24px' }}>
//         Indus Renewal Dashboard
//       </header>

//       {/* Insert the DashboardTiles component */}
//       <DashboardTiles averageStandardIncrease={averageStandardIncrease} />

//       <div style={{ display: 'flex', flexDirection: 'row', marginTop: '20px' }}>
//         <div style={{ flex: 1 }}>
//           <h2>Driver Table</h2>
//           <table>
//             <thead>
//               <tr>
//                 <th>Property</th>
//                 <th>Standard Increase</th>
//                 <th>Proposed Increase</th>
//                 <th>Projected Renewal</th>
//               </tr>
//             </thead>
//             <tbody>
//               {driverData.map((row, index) => (
//                 <tr key={index}>
//                   <td
//                     style={{ cursor: 'pointer', color: 'blue' }}
//                     onClick={() => handlePropertyClick(row.Property)}
//                   >
//                     {row.Property}
//                   </td>
//                   <td>{(row['Standard Increase'] * 100).toFixed(2)}%</td>
//                   <td>
//                     <input
//                       type="number"
//                       value={(row['Proposed Increase'] * 100).toFixed(2) || ''}
//                       onChange={e => handleInputChange(index, e)}
//                     />
//                     %
//                   </td>
//                   <td>{row['Projected Renewal'] !== 'N/A' && !isNaN(row['Projected Renewal']) 
//                           ? row['Projected Renewal'].toFixed(2) 
//                           : 'N/A'}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
//           <div style={{ flex: 1, marginBottom: '20px' }}>
//             <RentSummaryGraph chartData={chartData} />
//           </div>
//           <div style={{ flex: 1 }}>
//             <IncreaseByPropertyGraph data={driverData} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;



