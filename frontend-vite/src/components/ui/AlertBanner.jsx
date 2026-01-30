import React from "react";

const AlertBanner = ({ alert, prediction }) => {
  if (!alert) return null;

  return (
    <div className="bg-red-600 text-white p-4 rounded text-center">
      <strong>⚠️ Health Alert Triggered!</strong>
      <p>Anomaly score: {prediction?.toFixed(2)}</p>
    </div>
  );
};

export default AlertBanner;