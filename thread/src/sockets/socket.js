import { io } from "socket.io-client";

export const createSocket = (userId) => {
  const socketURL =
    process.env.NODE_ENV === 'production'
      ? "https://clone-instagram-117m.onrender.com"
      : "http://localhost:5000";
  return io(socketURL, {
    query: { userId },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });
};
