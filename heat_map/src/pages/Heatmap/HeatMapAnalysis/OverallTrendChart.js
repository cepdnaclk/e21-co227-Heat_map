import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OverallTrendChart = ({ data }) => {
  return (
    <div className="p-4 bg-white rounded-xl shadow my-6 overflow-x-auto">
      <h2 className="text-lg font-semibold mb-2">Overall Crowd Trend</h2>
      <div style={{ width: "100%", minWidth: "500px" }}>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="buildingName"
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="currentCount" 
              name="Current Count" 
              stroke="#8884d8" 
              activeDot={{ r: 8 }} 
            />
            <Line 
              type="monotone" 
              dataKey="predictedCount" 
              name="Predicted Count" 
              stroke="#82ca9d" 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OverallTrendChart;