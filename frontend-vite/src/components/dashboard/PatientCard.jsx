// src/components/dashboard/PatientCard.jsx

import React from "react";

const PatientCard = ({ name, age, gender, bedNumber }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow w-full md:w-72">
      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white text-center">
        Patient Info
      </h3>
      <div className="text-gray-700 dark:text-gray-300 space-y-1">
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Age:</strong> {age}</p>
        <p><strong>Gender:</strong> {gender}</p>
        <p><strong>Bed No:</strong> {bedNumber}</p>
      </div>
    </div>
  );
};

export default PatientCard;