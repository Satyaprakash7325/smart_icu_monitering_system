import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const VitalsChart = ({ vitals }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!vitals) return;

    const timestamp = new Date().toLocaleTimeString();

    const newEntry = {
      time: timestamp,
      hr: vitals.heart_rate,
      spo2: vitals.spo2,
      temp: vitals.temperature,
      bp: vitals.bp_systolic || 0, // Optional: combine systolic + diastolic
    };

    setData((prevData) => {
      const updated = [...prevData, newEntry];
      return updated.length > 20 ? updated.slice(-20) : updated;
    });
  }, [vitals]);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg w-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Vitals Chart</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VitalsLine title="Heart Rate (BPM)" dataKey="hr" color="#ef4444" data={data} />
        <VitalsLine title="SpO₂ (%)" dataKey="spo2" color="#3b82f6" data={data} />
        <VitalsLine title="Temperature (°C)" dataKey="temp" color="#f59e0b" data={data} />
        <VitalsLine title="Systolic BP (mmHg)" dataKey="bp" color="#10b981" data={data} />
      </div>
    </div>
  );
};

const VitalsLine = ({ title, dataKey, color, data }) => (
  <div>
    <h3 className="text-sm font-medium text-gray-700 mb-1">{title}</h3>
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
        <YAxis domain={["auto", "auto"]} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default VitalsChart;
