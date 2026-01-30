import React from "react";

const PatientInfo = () => {
  const patient = {
    name: "John Doe",
    age: 56,
    gender: "Male",
    patientId: "ICU12345",
    room: "B-12",
    doctor: "Dr. Smith",
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg space-y-2">
      <h2 className="text-xl font-semibold text-gray-800">Patient Info</h2>
      <div className="text-sm text-gray-700">
        <p><strong>Name:</strong> {patient.name}</p>
        <p><strong>Age:</strong> {patient.age}</p>
        <p><strong>Gender:</strong> {patient.gender}</p>
        <p><strong>Patient ID:</strong> {patient.patientId}</p>
        <p><strong>Room:</strong> {patient.room}</p>
        <p><strong>Doctor:</strong> {patient.doctor}</p>
      </div>
    </div>
  );
};

export default PatientInfo;