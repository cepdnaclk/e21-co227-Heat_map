import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

const LineGraph = ({ data }) => (
  <div className="bg-white rounded-xl shadow p-4 w-full">
    <h2 className="text-lg font-semibold mb-4 text-center">Crowd Trend Line Graph</h2>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        {/* Only display building name on X axis */}
        <XAxis 
          dataKey="buildingName"
        />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line type="monotone" dataKey="currentCount" stroke="#8884d8" name="Current Count" />
        <Line type="monotone" dataKey="predictedCount" stroke="#82ca9d" name="Predicted Count" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default LineGraph;