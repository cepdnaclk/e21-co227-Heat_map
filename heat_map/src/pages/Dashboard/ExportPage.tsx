import React from "react";
import ExportWidget from "./components/ExportWidget"; // adjust path if needed

const ExportPage: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Export</h2>
      <ExportWidget />
    </div>
  );
};

export default ExportPage;
