// src/components/ui/BuzzerToggle.jsx
import React, { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import Button from "./button"; // Ensure your custom Button supports className and children

const BuzzerToggle = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleToggle = async () => {
    const newMuted = !isMuted;

    try {
      const response = await fetch("http://192.168.70.148/mute-buzzer", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: newMuted ? "true" : "false",
      });

      const data = await response.json();
      setIsMuted(newMuted);
      setStatusMessage(data.status || "✅ Command sent to ESP32");
    } catch (error) {
      console.error("Error:", error);
      setStatusMessage("❌ Failed to communicate with ESP32");
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        onClick={handleToggle}
        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-2xl shadow-md flex items-center gap-2"
      >
        {isMuted ? <BellOff /> : <Bell />}
        {isMuted ? "Unmute Buzzer" : "Mute Buzzer"}
      </Button>

      {statusMessage && (
        <p className="text-sm text-gray-700 dark:text-gray-300 text-center">{statusMessage}</p>
      )}
    </div>
  );
};

export default BuzzerToggle;