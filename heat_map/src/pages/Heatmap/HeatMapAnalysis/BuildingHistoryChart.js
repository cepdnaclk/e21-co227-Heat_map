import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BuildingHistoryChart = ({ data, title = "Past 2 Minutes Crowd Variation" }) => {
  return (
    <div className="p-4 bg-white rounded-xl shadow overflow-x-auto">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div style={{ width: "50%", minWidth: "500px" }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="current_count" 
              name="Current Count"
              stroke="#8884d8" 
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BuildingHistoryChart;