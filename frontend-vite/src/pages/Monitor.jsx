// src/pages/Monitor.jsx
import React from "react";
import ICUMonitor from "../components/dashboard/ICUMonitor";
import TopBar from "../components/ui/TopBar";

const Monitor = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar title="SMART ICU Monitor" />
      <main className="p-4">
        <ICUMonitor />
      </main>
    </div>
  );
};

export default Monitor;