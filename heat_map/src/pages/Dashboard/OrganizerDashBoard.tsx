import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";

// Import pages
import OverviewPage from "./OverviewPage";
import HeatmapsPage from "./HeatmapsPage";
import FeedbackPage from "./FeedbackPage";
import ExportPage from "./ExportPage";
import BuildingsPage from "./BuildingsPage";
import EventsPage from "./EventsPage";

// Import Organizer management components
import OrgMngWidget from "./OrgMngWidget";
import OrgMngPage from "./OrgMngPage";

interface OrganizerDashBoardProps {
  onLogout: () => void;
}

function OrganizerDashBoard({ onLogout }: OrganizerDashBoardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Get the current date in a nice format
  const currentDate = new Date().toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          eventInfo={{
            title: "EngEx 2025 - PeraVerse Exhibition Management System by PeraCom",
            date: currentDate, // Dynamically updated date
            location: "Faculty of Engineering University of Peradeniya",
          }}
          userInfo={{
            name: "Organizer",
            role: "Admin",
          }}
          onLogout={onLogout}
        />

        {/* Routes */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            {/* Default → redirect to /overview */}
            <Route index element={<Navigate to="overview" replace />} />

            {/* Route Definitions */}
            <Route path="overview" element={<OverviewPage />} />
            <Route path="heatmaps" element={<HeatmapsPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="export" element={<ExportPage />} />
            <Route path="buildings" element={<BuildingsPage />} />
            <Route path="events" element={<EventsPage />} />

            {/* Organizers routes */}
            <Route path="organizers" element={<OrgMngWidget />} /> {/* List all organizers */}
            <Route path="organizers/:id" element={<OrgMngPage />} /> {/* Edit a specific organizer */}

            {/* Fallback: redirect unknown dashboard routes to overview */}
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default OrganizerDashBoard;
