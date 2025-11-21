import React from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Custom tooltip to show building name, time, current and predicted count
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const { timestamp, currentCount, predictedCount } = payload[0].payload;
    return (
      <div className="bg-white p-2 rounded shadow text-sm border border-gray-200">
        <div><strong>Building:</strong> {label}</div>
        <div><strong>Time:</strong> {timestamp}</div>
        <div><strong>Current Count:</strong> {currentCount}</div>
        <div><strong>Predicted Count:</strong> {predictedCount}</div>
      </div>
    );
  }
  return null;
};

const BuildingBarChart = ({ data }) => {
  return (
    <div className="p-4 bg-white rounded-xl shadow overflow-x-auto">
      <h2 className="text-lg font-semibold mb-2">Current vs Predicted</h2>
      <div style={{ width: "100%", minWidth: "500px" }}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            {/* Only display building name on X axis */}
            <XAxis 
              dataKey="buildingName"
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="currentCount" fill="#8884d8" />
            <Bar dataKey="predictedCount" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BuildingBarChart;