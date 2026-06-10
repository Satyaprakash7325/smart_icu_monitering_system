import React from "react";
import { User, Bed, Heart, Stethoscope, Hash } from "lucide-react";

const PatientInfo = ({ vitals }) => {
  const patient = {
    name: "John Doe",
    age: 56,
    gender: "Male",
    patientId: "ICU-10294",
    room: "ICU Ward B",
    bed: "Bed 04",
    doctor: "Dr. Sarah Jenkins",
  };

  const hrVal = vitals?.heart_rate || 0;
  const spo2Val = vitals?.spo2 || 0;
  const tempVal = vitals?.temperature || 0;

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl w-full text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-5 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <User size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">{patient.name}</span>
              <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full">
                {patient.age} y/o • {patient.gender}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-0.5">
              <Hash size={12} className="text-slate-500" />
              <span>{patient.patientId}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Vitals Bar */}
        <div className="flex gap-4">
          <div className="bg-slate-950/60 border border-slate-850 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
            <Heart size={16} className={`text-cyan-400 ${hrVal > 0 ? "animate-pulse" : ""}`} />
            <div className="font-mono">
              <div className="text-[10px] text-slate-500 uppercase font-semibold leading-none">HR</div>
              <div className="text-sm font-bold text-slate-200 leading-none mt-1">{hrVal || "--"}<span className="text-[9px] text-slate-500 font-normal"> bpm</span></div>
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-850 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <div className="font-mono">
              <div className="text-[10px] text-slate-500 uppercase font-semibold leading-none">SpO₂</div>
              <div className="text-sm font-bold text-slate-200 leading-none mt-1">{spo2Val || "--"}<span className="text-[9px] text-slate-500 font-normal">%</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-mono text-slate-300">
        <div className="flex items-center gap-2.5 bg-slate-950/40 p-3 rounded-xl border border-slate-850/40">
          <Bed size={16} className="text-slate-500" />
          <div>
            <span className="text-[10px] text-slate-500 block uppercase leading-none mb-1">Location</span>
            <span className="font-bold text-slate-200">{patient.room} • {patient.bed}</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 bg-slate-950/40 p-3 rounded-xl border border-slate-850/40">
          <Stethoscope size={16} className="text-slate-500" />
          <div>
            <span className="text-[10px] text-slate-500 block uppercase leading-none mb-1">Attending Physician</span>
            <span className="font-bold text-slate-200">{patient.doctor}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientInfo;