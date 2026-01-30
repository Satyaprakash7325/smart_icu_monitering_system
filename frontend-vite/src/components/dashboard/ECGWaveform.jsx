import React, { useEffect, useRef } from "react";

const ECGWaveform = ({ ecgData }) => {
  const canvasRef = useRef(null);
  const dataRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;
    const speed = 2;

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = "#000"; // Black background for better visibility
      ctx.fillRect(0, 0, width, height);

      // Draw ECG line
      ctx.beginPath();
      ctx.moveTo(0, midY);

      const points = dataRef.current;
      for (let i = 0; i < points.length; i++) {
        const y = midY - points[i]; // adjust ECG value around center line
        ctx.lineTo(i * speed, y);
      }

      ctx.strokeStyle = "#22c55e"; // ECG line color: green
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const interval = setInterval(draw, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof ecgData === "number") {
      dataRef.current.push(ecgData);

      // Limit to keep drawing within canvas width
      const maxLength = Math.floor(600 / 2); // 600px width, speed=2 => 300 points
      if (dataRef.current.length > maxLength) {
        dataRef.current.shift();
      }
    }
  }, [ecgData]);

  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold text-green-400 mb-4">ECG Waveform</h2>
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        className="border border-gray-700 rounded w-full max-w-full"
      />
    </div>
  );
};

export default ECGWaveform;
