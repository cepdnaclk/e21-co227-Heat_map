import React from "react";
import HeatmapWidget from "./components/HeatmapWidget"; // adjust path if needed

const HeatmapsPage: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Heatmaps</h2>
      <HeatmapWidget />
    </div>
  );
};

export default HeatmapsPage;
