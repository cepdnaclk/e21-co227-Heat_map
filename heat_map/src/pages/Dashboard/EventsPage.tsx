import React from "react";
import EventsWidget from "./components/EventsWidget";

const EventsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Events</h2>
      <EventsWidget />
    </div>
  );
};

export default EventsPage;
