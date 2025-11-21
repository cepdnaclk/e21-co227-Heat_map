import React from 'react';
import Dashboard from '../Maps/Dashboard';

interface MapPageTailwindProps {}

const MapPageTailwind: React.FC<MapPageTailwindProps> = () => {
  

  return (
    <div className="flex flex-col w-full h-screen">
      <div className="flex-1 w-full h-full">
        <Dashboard kiosk_mode={true}/>
      </div>
    </div>
  );
};

export default MapPageTailwind;
