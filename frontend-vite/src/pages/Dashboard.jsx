import React from "react";
import ICUMonitor from "@/components/dashboard/ICUMonitor";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
        Smart ICU Monitoring Dashboard
      </h1>
      <ICUMonitor />
    </div>
  );
};

export default Dashboard;