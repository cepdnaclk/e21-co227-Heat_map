import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

const GaugeChart = ({ value, max, title, width = '100%', height = 250 }) => {
  // Calculate percentage (0-100)
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  // Determine color based on thresholds
  const getColor = (percent) => {
    if (percent >= 80) return '#ff4d4d'; // Red (crowded)
    if (percent >= 60) return '#ffa500'; // Orange (moderately crowded)
    return '#4caf50'; // Green (not crowded)
  };

  const color = getColor(percentage);
  
  // Data for the gauge
  const data = [
    { name: 'Occupied', value: percentage },
    { name: 'Free', value: 100 - percentage },
  ];
  
  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <div style={{ width, height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="80%"
              startAngle={180}
              endAngle={0}
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={0}
              dataKey="value"
            >
              <Cell key="occupied" fill={color} />
              <Cell key="free" fill="#e0e0e0" />
              <Label
                value={`${Math.round(percentage)}%`}
                position="center"
                fill="#333"
                style={{ fontSize: '24px', fontWeight: 'bold', dy: 30 }}
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-2">
        <div className="text-lg font-semibold">{value} / {max}</div>
        <div className="text-sm text-gray-500">Current Occupancy</div>
      </div>
    </div>
  );
};

export default GaugeChart;