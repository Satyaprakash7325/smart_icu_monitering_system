import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // ⚠️ Use your backend IP if not on same machine

socket.on("connect", () => {
  console.log("✅ Connected to backend");
});

export default socket;