import React, { useEffect, useState } from "react";
import socket from "@/api/socket";
import PatientInfo from "./PatientInfo";
import VitalsChart from "./VitalsChart";
import ECGWaveform from "./ECGWaveform";
import AlertBanner from "../ui/AlertBanner";
import ControlPanel from "./ControlPanel";

const ICUDashboard = () => {
  const [vitals, setVitals] = useState({
    temperature: 0,
    heartRate: 0,
    spO2: 0,
    bloodPressure: "0/0",
    ecg: [],
  });

  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [alert, setAlert] = useState(false);

  useEffect(() => {
    socket.on("vitals_data", (data) => {
      setVitals(data);

      const formatted = {
        time: new Date().toLocaleTimeString(),
        hr: data.heartRate,
        spo2: data.spO2,
        temp: data.temperature,
        bp: data.bloodPressure,
      };

      setVitalsHistory((prev) => [...prev.slice(-59), formatted]);
      setAlert(data.anomaly === 1);
    });

    return () => {
      socket.off("vitals_data");
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-gray-900 p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center text-white">
        Smart ICU Monitoring Dashboard
      </h1>

      {alert && <AlertBanner message="⚠️ Abnormal Condition Detected!" />}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <PatientInfo />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <ControlPanel />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <VitalsChart data={vitalsHistory} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-lg">
        <ECGWaveform ecgData={vitals.ecg} />
      </div>
    </div>
  );
};

export default ICUDashboard;
