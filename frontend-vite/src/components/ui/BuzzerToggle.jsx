// src/components/ui/BuzzerToggle.jsx
import React, { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import Button from "./button"; // Custom Button component

const BuzzerToggle = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleToggle = async () => {
    const newMuted = !isMuted;
    setStatusMessage("⏳ Sending command...");

    try {
      const response = await fetch("http://localhost:5000/mute-buzzer", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: newMuted ? "true" : "false",
      });

      const data = await response.json();
      if (response.ok) {
        setIsMuted(newMuted);
        setStatusMessage(data.status || "✅ ESP32 buzzer command sent");
      } else {
        setStatusMessage(`❌ Error: ${data.message || "Request failed"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setStatusMessage("❌ Failed to communicate with Flask server");
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        onClick={handleToggle}
        className={`px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 font-medium transition duration-200 ${
          isMuted
            ? "bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600"
            : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/30"
        }`}
      >
        {isMuted ? <BellOff size={18} /> : <Bell size={18} />}
        {isMuted ? "Unmute ICU Alarm" : "Mute ICU Alarm"}
      </Button>

      {statusMessage && (
        <p className="text-xs text-slate-400 text-center font-medium mt-1">
          {statusMessage}
        </p>
      )}
    </div>
  );
};

export default BuzzerToggle;