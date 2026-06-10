import React, { useEffect, useState } from "react";
import socket from "@/api/socket";
import VitalsChart from "./VitalsChart";
import ECGWaveform from "./ECGWaveform";
import AlertBanner from "../ui/AlertBanner";
import BuzzerToggle from "../ui/BuzzerToggle";
import PatientInfo from "./PatientInfo";
import { Heart, Activity, Thermometer, Droplets } from "lucide-react";

const ICUMonitor = () => {
  const [vitals, setVitals] = useState({
    heart_rate: 0,
    spo2: 0,
    temperature: 0,
    bp_systolic: 0,
    bp_diastolic: 0,
    ecg: 0,
    alert: false,
    prediction: 0.0,
    time: "--:--:--",
  });
  const [alerts, setAlerts] = useState([]);
  const [isBuzzing, setIsBuzzing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connection monitoring
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Handle incoming vitals
    socket.on("vitals", (data) => {
      const timeStr = data.timestamp || new Date().toLocaleTimeString();

      setVitals({
        heart_rate: data.heart_rate,
        spo2: data.spo2,
        temperature: data.temperature,
        bp_systolic: data.bp_systolic,
        bp_diastolic: data.bp_diastolic,
        ecg: data.ecg,
        alert: data.alert,
        prediction: data.prediction,
        time: timeStr,
      });

      // Simple threshold rules
      const newAlerts = [];
      if (data.heart_rate < 60 || data.heart_rate > 100) {
        newAlerts.push(`Abnormal Heart Rate: ${data.heart_rate} bpm (safe: 60-100)`);
      }
      if (data.spo2 < 95) {
        newAlerts.push(`Critical SpO₂ Level: ${data.spo2}% (safe: >=95%)`);
      }
      if (data.temperature < 36.0 || data.temperature > 37.5) {
        newAlerts.push(`Abnormal Body Temp: ${data.temperature.toFixed(1)}°C (safe: 36.0-37.5)`);
      }
      if (data.bp_systolic > 140 || data.bp_diastolic > 90) {
        newAlerts.push(`Elevated Blood Pressure: ${data.bp_systolic}/${data.bp_diastolic} mmHg`);
      }

      setAlerts(newAlerts);
      setIsBuzzing(data.alert || newAlerts.length > 0);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("vitals");
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      {/* Upper Status Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Smart ICU Workstation
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-mono uppercase tracking-widest">
            Predictive Patient Monitoring System
          </p>
        </div>
        
        {/* Live Status indicator */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl">
          <div className={`w-2 h-2 rounded-full ${isConnected || vitals.heart_rate > 0 ? "bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-ping" : "bg-rose-500 animate-pulse"}`} />
          <span className="text-xs font-mono text-slate-300 uppercase">
            {isConnected || vitals.heart_rate > 0 ? "LIVE TELEMETRY ACTIVE" : "DISCONNECTED FROM SERVER"}
          </span>
        </div>
      </div>

      {/* Vitals Telemetry Readouts Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <VitalReadoutCard
          title="Heart Rate"
          value={vitals.heart_rate}
          unit="bpm"
          icon={<Heart size={18} className="text-cyan-400 animate-pulse" />}
          colorClass="text-cyan-400 border-cyan-500/20 bg-cyan-950/10"
          threshold="60 - 100"
          status={vitals.heart_rate < 60 || vitals.heart_rate > 100 ? "WARNING" : "NORMAL"}
        />
        <VitalReadoutCard
          title="Blood Oxygen (SpO₂)"
          value={vitals.spo2}
          unit="%"
          icon={<Droplets size={18} className="text-blue-400" />}
          colorClass="text-blue-400 border-blue-500/20 bg-blue-950/10"
          threshold=">= 95"
          status={vitals.spo2 < 95 ? "CRITICAL" : "NORMAL"}
        />
        <VitalReadoutCard
          title="Body Temperature"
          value={vitals.temperature ? vitals.temperature.toFixed(1) : 0}
          unit="°C"
          icon={<Thermometer size={18} className="text-amber-400" />}
          colorClass="text-amber-400 border-amber-500/20 bg-amber-950/10"
          threshold="36.0 - 37.5"
          status={vitals.temperature < 36.0 || vitals.temperature > 37.5 ? "WARNING" : "NORMAL"}
        />
        <VitalReadoutCard
          title="Blood Pressure"
          value={`${vitals.bp_systolic}/${vitals.bp_diastolic}`}
          unit="mmHg"
          icon={<Activity size={18} className="text-pink-400" />}
          colorClass="text-pink-400 border-pink-500/20 bg-pink-950/10"
          threshold="120/80"
          status={vitals.bp_systolic > 140 || vitals.bp_diastolic > 90 ? "WARNING" : "NORMAL"}
        />
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Area (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Patient Details & Control */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PatientInfo vitals={vitals} />
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-md font-bold text-slate-200 border-b border-slate-800 pb-3 mb-4">
                  ICU Audio Alarm Control
                </h3>
                <p className="text-xs text-slate-400 font-mono leading-relaxed mb-6">
                  Muting disables the physical buzzer on the ESP32 bedside monitor unit. Visual notifications on this dashboard will remain active.
                </p>
              </div>
              <div className="flex justify-center">
                <BuzzerToggle />
              </div>
            </div>
          </div>

          {/* ECG Waveform Canvas */}
          <ECGWaveform ecgData={vitals.ecg} />

          {/* Recharts Vital Lines */}
          <VitalsChart vitals={vitals} />
        </div>

        {/* Right Area (1/3 width on large screens) */}
        <div className="h-full">
          <AlertBanner alert={vitals.alert} prediction={vitals.prediction} ruleAlerts={alerts} />
        </div>
      </div>
    </div>
  );
};

// Vital Card Component
const VitalReadoutCard = ({ title, value, unit, icon, colorClass, threshold, status }) => {
  const isAlert = status === "WARNING" || status === "CRITICAL";
  return (
    <div className={`border rounded-2xl p-5 shadow-lg flex items-center justify-between ${colorClass}`}>
      <div>
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono">
          {title}
        </span>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-3xl font-extrabold tracking-tight font-mono">
            {value}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {unit}
          </span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-3 uppercase">
          Safe Threshold: {threshold}
        </div>
      </div>

      <div className="flex flex-col items-end gap-3">
        <div className="p-2.5 bg-slate-950/60 border border-slate-850 rounded-xl">
          {icon}
        </div>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
          isAlert 
            ? "bg-rose-500/15 text-rose-400 border border-rose-500/20 animate-pulse" 
            : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
        }`}>
          {status}
        </span>
      </div>
    </div>
  );
};

export default ICUMonitor;
