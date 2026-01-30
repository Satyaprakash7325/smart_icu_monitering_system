// src/components/dashboard/LogViewer.jsx

import React from "react";

const LogViewer = ({ logs }) => {
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md h-64 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white text-center">
        Event Logs
      </h2>
      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
        {logs.length === 0 ? (
          <li className="text-center text-gray-500">No logs yet.</li>
        ) : (
          logs.map((log, index) => (
            <li key={index} className="border-b border-gray-200 dark:border-gray-700 pb-1">
              {log}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default LogViewer;