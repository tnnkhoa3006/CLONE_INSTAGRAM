import { io } from "socket.io-client";

const URL = "http://localhost:5000";

// Add a 'type' parameter to distinguish connections
export const createSocket = (userId, type = 'main') => {
    return io(URL, {
        autoConnect: true,
        query: {
            userId,
            type, // 'main' or 'call'
        }
    });
};
