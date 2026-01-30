// src/components/ui/card.jsx
import React from "react";

const Card = ({ title, value, unit }) => {
  return (
    <div className="bg-white shadow rounded p-4 text-center">
      <h3 className="text-md font-semibold text-gray-700">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">
        {value} <span className="text-sm font-medium">{unit}</span>
      </p>
    </div>
  );
};

export default Card;