import { Server } from 'socket.io';
import express from 'express';
import http from 'http';

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: `${process.env.URL_FRONTEND}`,
        methods: ['GET', 'POST'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
    },
    transports: ['websocket', 'polling']
});

const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
}

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    console.log('New socket connection attempt:', socket.id);
    
    if (userId) {
        userSocketMap[userId] = socket.id;
        console.log(`User connected: ${userId}, socketId: ${socket.id}`);
        
        socket.emit('userConnected', { userId, socketId: socket.id });
    } else {
        console.log('Connection without userId');
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', (reason) => {
        console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`);
        if (userId && userSocketMap[userId]) {
            delete userSocketMap[userId];
            console.log(`User disconnected: ${userId}`);
        }
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
})

export { app, server, io };