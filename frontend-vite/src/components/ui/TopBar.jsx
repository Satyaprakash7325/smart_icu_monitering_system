import React from "react";

const TopBar = ({ title }) => {
  return (
    <div className="bg-blue-700 text-white p-4 shadow-md">
      <h1 className="text-xl font-bold">{title}</h1>
    </div>
  );
};

export default TopBar;