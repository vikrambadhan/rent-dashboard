import React from 'react';

const DashboardTiles = ({ averageStandardIncrease, averageProjectedRenewal }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
      <div style={{ flex: 1, padding: '20px', backgroundColor: '#f0f0f0', marginRight: '10px', textAlign: 'center' }}>
        <h3>Average Standard Increase</h3>
        <p>{averageStandardIncrease}%</p>
      </div>
      <div style={{ flex: 1, padding: '20px', backgroundColor: '#f0f0f0', marginRight: '10px', textAlign: 'center' }}>
        <h3>Average Projected Renewal</h3>
        <p>{averageProjectedRenewal}</p>
      </div>
      <div style={{ flex: 1, padding: '20px', backgroundColor: '#f0f0f0', marginRight: '10px', textAlign: 'center' }}>
        <h3>Metric 3</h3>
        <p>-</p>
      </div>
      <div style={{ flex: 1, padding: '20px', backgroundColor: '#f0f0f0', textAlign: 'center' }}>
        <h3>Metric 4</h3>
        <p>-</p>
      </div>
    </div>
  );
};

export default DashboardTiles;

