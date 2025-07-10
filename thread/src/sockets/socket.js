import { io } from "socket.io-client";

export const createSocket = (userId) => {
  const socketURL = "https://clone-instagram-117m.onrender.com";
  console.log("SOCKET_URL:", import.meta.env.VITE_URL_BACKEND); // phải in ra http://localhost:5000

  return io(socketURL, {
    query: { userId },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });
};
