import React from "react";
import OverviewWidget from "./components/OverviewWidget";

const OverviewPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Overview</h2>
      <OverviewWidget />
    </div>
  );
};

export default OverviewPage;

