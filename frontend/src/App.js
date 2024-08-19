import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, CategoryScale } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale);

function App() {
  const [driverData, setDriverData] = useState([]);
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
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    fetchDriverData();
  }, []);

  const fetchDriverData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/driver-data');
      console.log('Driver data fetched:', response.data);
      setDriverData(response.data);
    } catch (error) {
      console.error("Error fetching driver data:", error);
    }
  };

  const handleInputChange = (index, event) => {
    const newData = [...driverData];
    newData[index]['Proposed Increase'] = parseFloat(event.target.value) / 100 || 0;

    // Log the entire row object for inspection
    console.log(`Row data for index ${index}:`, newData[index]);

    // Calculate the new Projected Renewal immediately
    const updatedDriverData = newData.map(row => {
      const increase = row['Proposed Increase'] !== undefined ? row['Proposed Increase'] : row['Standard Increase'];
      
      console.log(`Calculating for Property: ${row.Property}`);
      console.log(`Base Rent: ${row['Base Rent']}`);
      console.log(`Increase: ${increase}`);

      // Temporary fallback value for testing
      const baseRent = row['Base Rent'] !== undefined ? row['Base Rent'] : 1000;  // Default value for testing

      if (baseRent && !isNaN(baseRent) && !isNaN(increase)) {
        row['Projected Renewal'] = baseRent * (1 + increase);
        console.log(`Projected Renewal: ${row['Projected Renewal']}`);
      } else {
        console.warn(`Missing or invalid Base Rent for property: ${row.Property}`);
        row['Projected Renewal'] = 'N/A';  // Mark as N/A if Base Rent is missing or invalid
      }

      return row;
    });

    setDriverData(updatedDriverData);

    // Update the chart immediately if a property is selected
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
            data: rentData.map(value => (value !== 'N/A' && !isNaN(value) ? value : null)), // Ensure the chart data is numeric or null
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
    <div className="App" style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{ flex: 1 }}>
        <h1>Rent Dashboard</h1>
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

      {chartData && (
        <div style={{ flex: 1, marginLeft: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <h2>Rent Summary</h2>
          <Line data={chartData} />
          {selectedProperty && (
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
              <h3>Selected Property: {selectedProperty}</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;







// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './App.css';
// import { Line } from 'react-chartjs-2';
// import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, CategoryScale } from 'chart.js';

// ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale);

// function App() {
//   const [driverData, setDriverData] = useState([]);
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
//   const [selectedProperty, setSelectedProperty] = useState(null);

//   useEffect(() => {
//     fetchDriverData();
//   }, []);

//   const fetchDriverData = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/driver-data');
//       console.log('Driver data fetched:', response.data);
//       setDriverData(response.data);
//     } catch (error) {
//       console.error("Error fetching driver data:", error);
//     }
//   };

//   const handleInputChange = (index, event) => {
//     const newData = [...driverData];
//     newData[index]['Proposed Increase'] = parseFloat(event.target.value) / 100 || 0;
//     setDriverData(newData);
//     if (selectedProperty) {
//       updateChart(selectedProperty, newData);
//     }
//   };

//   const calculateRenewal = async () => {
//     try {
//       const response = await axios.post('http://localhost:5000/calculate-renewal', { driverData });
//       console.log('Renewal calculated:', response.data);
//       setDriverData(response.data);
//       if (selectedProperty) {
//         updateChart(selectedProperty, response.data);
//       }
//     } catch (error) {
//       console.error("Error calculating renewal:", error);
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
//             data: rentData,
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
//     <div className="App" style={{ display: 'flex', flexDirection: 'row' }}>
//       <div style={{ flex: 1 }}>
//         <h1>Rent Dashboard</h1>
//         <table>
//           <thead>
//             <tr>
//               <th>Property</th>
//               <th>Standard Increase</th>
//               <th>Proposed Increase</th>
//               <th>Projected Renewal</th>
//             </tr>
//           </thead>
//           <tbody>
//             {driverData.map((row, index) => (
//               <tr key={index}>
//                 <td
//                   style={{ cursor: 'pointer', color: 'blue' }}
//                   onClick={() => handlePropertyClick(row.Property)}
//                 >
//                   {row.Property}
//                 </td>
//                 <td>{(row['Standard Increase'] * 100).toFixed(2)}%</td>
//                 <td>
//                   <input
//                     type="number"
//                     value={(row['Proposed Increase'] * 100).toFixed(2) || ''}
//                     onChange={e => handleInputChange(index, e)}
//                   />
//                   %
//                 </td>
//                 <td>{row['Projected Renewal'] ? row['Projected Renewal'].toFixed(2) : 'N/A'}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <button onClick={calculateRenewal}>Calculate Renewal</button>
//       </div>

//       {chartData && (
//         <div style={{ flex: 1, marginLeft: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
//           <h2>Rent Summary</h2>
//           <Line data={chartData} />
//           {selectedProperty && (
//             <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
//               <h3>Selected Property: {selectedProperty}</h3>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;












