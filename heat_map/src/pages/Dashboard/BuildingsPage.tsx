import React from "react";
import BuildingsWidget from "./components/BuildingsWidget";

const BuildingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Buildings</h2>
      <BuildingsWidget />
    </div>
  );
};

export default BuildingsPage;
