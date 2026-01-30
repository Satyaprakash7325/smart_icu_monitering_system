// src/components/dashboard/ControlPanel.jsx

import React from "react";
import BuzzerToggle from "../ui/BuzzerToggle";
import AlertStatus from "../ui/AlertStatus";

const ControlPanel = ({ prediction }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white text-center">
        Control Panel
      </h2>

      <AlertStatus prediction={prediction} />
      <BuzzerToggle />
    </div>
  );
};

export default ControlPanel;