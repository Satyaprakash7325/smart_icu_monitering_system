// import React, { useEffect, useState } from "react";
// import socket from "@/api/socket"; // Use default import
// import VitalsChart from "./VitalsChart";
// import ECGWaveform from "./ECGWaveform";
// import AlertBanner from "../ui/AlertBanner";
// import BuzzerToggle from "../ui/BuzzerToggle";
// import PatientInfo from "./PatientInfo";

// const ICUMonitor = () => {
//   const [vitals, setVitals] = useState({
//     heart_rate: 0,
//     spo2: 0,
//     temperature: 0,
//     bp_systolic: 0,
//     bp_diastolic: 0,
//     ecg: 0,
//   });

//   const [alerts, setAlerts] = useState([]);
//   const [isBuzzing, setIsBuzzing] = useState(false);

//   useEffect(() => {
//     socket.on("vitals_data", (data) => {
//       setVitals(data);

//       const newAlerts = [];
//       if (data.heart_rate < 60 || data.heart_rate > 100) {
//         newAlerts.push("Abnormal Heart Rate Detected");
//       }
//       if (data.spo2 < 95) {
//         newAlerts.push("Low SpO₂ Level");
//       }
//       if (data.temperature < 36 || data.temperature > 37.5) {
//         newAlerts.push("Abnormal Body Temperature");
//       }
//       if (data.bp_systolic > 140 || data.bp_diastolic > 90) {
//         newAlerts.push("High Blood Pressure");
//       }

//       setAlerts(newAlerts);
//       setIsBuzzing(newAlerts.length > 0);
//     });

//     return () => {
//       socket.off("vitals_data");
//     };
//   }, []);

//   return (
//     <div className="min-h-screen bg-slate-900 p-4">
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//         {/* Left Column */}
//         <div className="space-y-4">
//           <div className="bg-white p-4 rounded-2xl shadow-lg">
//             <PatientInfo vitals={vitals} />
//           </div>

//           <div className="bg-white p-4 rounded-2xl shadow-lg">
//             <VitalsChart vitals={vitals} />
//           </div>

//           <div className="bg-white p-4 rounded-2xl shadow-lg">
//             <ECGWaveform ecgData={vitals.ecg} />
//           </div>

//           <div className="bg-white p-4 rounded-2xl shadow-lg">
//             <BuzzerToggle isOn={isBuzzing} />
//           </div>
//         </div>

//         {/* Right Column */}
//         <div className="space-y-4">
//           <div className="bg-white p-4 rounded-2xl shadow-lg">
//             <AlertBanner alerts={alerts} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ICUMonitor;

// src/components/dashboard/ICUMonitor.jsx
import React, { useEffect, useState } from "react";
import socket from "@/api/socket";
import VitalsChart from "./VitalsChart";
import ECGWaveform from "./ECGWaveform";
import AlertBanner from "../ui/AlertBanner";
import BuzzerToggle from "../ui/BuzzerToggle";
import PatientInfo from "./PatientInfo";

const ICUMonitor = () => {
  const [vitals, setVitals] = useState({
    heart_rate: 0,
    spo2: 0,
    temperature: 0,
    bp_systolic: 0,
    bp_diastolic: 0,
    ecg: 0,
    time: new Date().toLocaleTimeString(),
  });
  const [chartData, setChartData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isBuzzing, setIsBuzzing] = useState(false);

  useEffect(() => {
    socket.on("vitals", (data) => {
      const formattedData = {
        hr: data.heart_rate,
        spo2: data.spo2,
        temp: data.temperature,
        bp: data.systolic,
        time: new Date().toLocaleTimeString(),
      };

      setVitals({
        heart_rate: data.heart_rate,
        spo2: data.spo2,
        temperature: data.temperature,
        bp_systolic: data.systolic,
        bp_diastolic: data.diastolic,
        ecg: data.ecg,
        time: formattedData.time,
      });

      setChartData((prev) => [...prev.slice(-19), formattedData]);

      const newAlerts = [];
      if (data.heart_rate < 60 || data.heart_rate > 100) {
        newAlerts.push("Abnormal Heart Rate Detected");
      }
      if (data.spo2 < 95) {
        newAlerts.push("Low SpO₂ Level");
      }
      if (data.temperature < 36 || data.temperature > 37.5) {
        newAlerts.push("Abnormal Body Temperature");
      }
      if (data.systolic > 140 || data.diastolic > 90) {
        newAlerts.push("High Blood Pressure");
      }

      setAlerts(newAlerts);
      setIsBuzzing(newAlerts.length > 0);
    });

    return () => {
      socket.off("vitals");
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-gray-800 p-6">
      <h1 className="text-white text-3xl font-bold mb-6 text-center">
        Smart ICU Monitoring Dashboard
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <PatientInfo vitals={vitals} />
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <VitalsChart data={chartData} />
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg space-y-4">
            <ECGWaveform ecgData={vitals.ecg} />
            <div className="flex justify-end">
              <BuzzerToggle isOn={isBuzzing} />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg h-full">
            <AlertBanner alerts={alerts} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ICUMonitor;
