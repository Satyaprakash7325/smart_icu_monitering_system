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
    if (!vitals || !vitals.time) return;

    const newEntry = {
      time: vitals.time,
      hr: vitals.heart_rate,
      spo2: vitals.spo2,
      temp: vitals.temperature,
      bp: vitals.bp_systolic || 0,
    };

    setData((prevData) => {
      // Avoid duplicate timestamps
      if (prevData.length > 0 && prevData[prevData.length - 1].time === newEntry.time) {
        return prevData;
      }
      const updated = [...prevData, newEntry];
      return updated.length > 20 ? updated.slice(-20) : updated;
    });
  }, [vitals]);

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl w-full">
      <h2 className="text-xl font-bold mb-6 text-slate-100 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
        Vitals Trend Analysis
      </h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <VitalsLine title="Heart Rate (BPM)" dataKey="hr" color="#06b6d4" data={data} unit=" bpm" domain={[40, 140]} />
        <VitalsLine title="SpO₂ (%)" dataKey="spo2" color="#3b82f6" data={data} unit="%" domain={[85, 100]} />
        <VitalsLine title="Temperature (°C)" dataKey="temp" color="#f59e0b" data={data} unit="°C" domain={[34, 42]} />
        <VitalsLine title="Systolic BP (mmHg)" dataKey="bp" color="#ec4899" data={data} unit=" mmHg" domain={[80, 180]} />
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 border border-slate-850 p-2.5 rounded-lg shadow-xl font-mono text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        <p style={{ color: payload[0].color }} className="font-bold">
          {payload[0].value}
          <span className="text-[10px] text-slate-500 font-normal">{unit}</span>
        </p>
      </div>
    );
  }
  return null;
};

const VitalsLine = ({ title, dataKey, color, data, unit, domain }) => (
  <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-xl">
    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
      <span>{title}</span>
      {data.length > 0 && (
        <span style={{ color }} className="font-mono text-sm font-bold">
          {data[data.length - 1][dataKey]}
          <span className="text-[10px] text-slate-500 font-normal">{unit}</span>
        </span>
      )}
    </h3>
    <ResponsiveContainer width="100%" height={140}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 9, fill: '#64748b' }} 
          stroke="#334155" 
          tickLine={false} 
        />
        <YAxis 
          domain={domain} 
          tick={{ fontSize: 9, fill: '#64748b' }} 
          stroke="#334155" 
          tickLine={false} 
        />
        <Tooltip content={<CustomTooltip unit={unit} />} />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default VitalsChart;
