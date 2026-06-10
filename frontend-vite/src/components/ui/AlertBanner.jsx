import React from "react";
import { ShieldAlert, ShieldCheck, Heart, AlertTriangle } from "lucide-react";

const AlertBanner = ({ alert, prediction, ruleAlerts = [] }) => {
  // If prediction is undefined, treat it as 0% risk
  const riskScore = prediction ? Math.min(Math.round(prediction * 100), 100) : 0;
  
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="text-cyan-400" size={22} />
            Clinical Status Center
          </h2>
          <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            Real-time Telemetry
          </span>
        </div>

        {/* AI ML Predictor Status Card */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-300">LSTM Predictive Anomaly Risk</span>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
              alert ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}>
              {alert ? "HIGH RISK" : "STABLE"}
            </span>
          </div>

          <div className="flex items-end gap-3 mb-3">
            <span className={`text-4xl font-extrabold font-mono tracking-tight ${
              alert ? "text-rose-500 animate-pulse" : "text-emerald-400"
            }`}>
              {riskScore}%
            </span>
            <span className="text-sm text-slate-500 mb-1">anomaly probability</span>
          </div>

          {/* Risk Level Bar */}
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-4">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                alert ? "bg-gradient-to-r from-orange-500 to-rose-500" : "bg-gradient-to-r from-teal-500 to-emerald-400"
              }`}
              style={{ width: `${riskScore}%` }}
            />
          </div>

          {/* Warning Message */}
          {alert ? (
            <div className="flex items-start gap-2 text-rose-400 text-xs bg-rose-500/5 p-3 rounded-lg border border-rose-500/10">
              <AlertTriangle className="flex-shrink-0 mt-0.5" size={14} />
              <span>LSTM model has identified a critical anomaly sequence in patient vitals. Immediate attention advised.</span>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-emerald-400 text-xs bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
              <ShieldCheck className="flex-shrink-0 mt-0.5" size={14} />
              <span>Cardiac/Respiratory wave patterns are classified as normal. Continuing sequence monitoring.</span>
            </div>
          )}
        </div>

        {/* Rule-Based Threshold Warnings */}
        <div className="space-y-3">
          <span className="text-sm font-semibold text-slate-300 block">Active Threshold Warnings</span>
          
          {ruleAlerts.length > 0 ? (
            <div className="space-y-2">
              {ruleAlerts.map((msg, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/10 text-amber-300 p-3.5 rounded-xl text-sm animate-pulse"
                >
                  <AlertTriangle className="text-amber-400 flex-shrink-0" size={16} />
                  <span className="font-medium">{msg}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-slate-950/40 border border-slate-800/40 text-slate-400 p-4 rounded-xl text-sm">
              <ShieldCheck className="text-emerald-500 flex-shrink-0" size={18} />
              <span>No parameter breaches. All vital metrics within normal standard range.</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 border-t border-slate-850 pt-4 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>ICU TELEMETRY WORKSTATION</span>
        <span>SYS OK</span>
      </div>
    </div>
  );
};

export default AlertBanner;