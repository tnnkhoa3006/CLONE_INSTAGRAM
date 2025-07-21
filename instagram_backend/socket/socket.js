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
    console.log('New socket connection attempt:', socket.id, socket.handshake.query.userId);
    
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

    // khi user gọi user khác
    socket.on('callUser', (data) => {
        try {
            console.log("Call Flow - Step 1: Received call request", {
                from: data.from,
                to: data.to,
                hasOffer: !!data.offer,
                offerType: data.offer?.type
            });

            const targetSocketId = userSocketMap[data.to];
            
            if (!targetSocketId) {
                console.error("Call Flow - Error: Target user not found", {
                    targetUserId: data.to,
                    availableUsers: Object.keys(userSocketMap)
                });
                return socket.emit('callError', {
                    error: 'User is offline',
                    to: data.to
                });
            }

            console.log("Call Flow - Step 2: Forwarding offer to target", {
                targetSocketId,
                fromUserId: data.from
            });

            io.to(targetSocketId).emit("callMade", {
                offer: data.offer,
                from: data.from,
                socket: socket.id
            });
        } catch (err) {
            console.error("Call Flow - Error in callUser:", err);
            socket.emit('callError', { error: err.message });
        }
    });

    // khi user trả lời
    socket.on('makeAnswer', (data) => {
        try {
            console.log("Call Flow - Step 3: Received answer", {
                from: data.from,
                to: data.to,
                hasAnswer: !!data.answer,
                answerType: data.answer?.type
            });

            io.to(data.to).emit("answerMade", {
                answer: data.answer,
                from: data.from,
                socket: socket.id
            });

            console.log("Call Flow - Step 4: Answer forwarded to caller");
        } catch (err) {
            console.error("Call Flow - Error in makeAnswer:", err);
        }
    });

    // trao đổi ICE candidate
    socket.on('iceCandidate', (data) => {
        try {
            if (!data.candidate) {
                console.warn("ICE Flow: Empty candidate received");
                return;
            }

            console.log("ICE Flow: Received candidate", {
                from: data.from,
                to: data.to,
                candidateType: data.candidate.candidate ? data.candidate.candidate.split(' ')[7] : undefined,
                protocol: data.candidate.candidate ? data.candidate.candidate.split(' ')[2] : undefined
            });

            const targetSocketId = userSocketMap[data.to];
            if (!targetSocketId) {
                console.error("ICE Flow - Error: Target user not found");
                return;
            }

            io.to(targetSocketId).emit("iceCandidate", {
                candidate: data.candidate,
                from: data.from
            });

            console.log("ICE Flow: Candidate forwarded successfully");
        } catch (err) {
            console.error("ICE Flow - Error:", err);
        }
    });

    // Add monitoring for ICE connection state changes
    socket.on('iceConnectionStateChange', (data) => {
        console.log("ICE Connection State Change:", {
            from: data.from,
            state: data.state,
            timestamp: new Date().toISOString()
        });
    });

    // --- CALL SIGNALING EVENTS ---
    socket.on('callUser', (data) => {
        const targetSocketId = userSocketMap[data.to];
        if (targetSocketId) {
            io.to(targetSocketId).emit("callMade", {
                offer: data.offer,
                from: data.from,
                caller: data.caller,
            });
        }
    });

    socket.on('makeAnswer', (data) => {
        const targetSocketId = userSocketMap[data.to];
        if (targetSocketId) {
            io.to(targetSocketId).emit("answerMade", {
                answer: data.answer,
                from: data.from,
            });
        }
    });

    socket.on('iceCandidate', (data) => {
        const targetSocketId = userSocketMap[data.to];
        if (targetSocketId) {
            io.to(targetSocketId).emit("iceCandidate", {
                candidate: data.candidate,
                from: data.from,
            });
        }
    });

    socket.on('endCall', (data) => {
        const targetSocketId = userSocketMap[data.to];
        if (targetSocketId) {
            io.to(targetSocketId).emit('callEnded');
        }
    });

    // --- DECLINE CALL EVENT ---
    socket.on('declineCall', (data) => {
        const targetSocketId = userSocketMap[data.to];
        if (targetSocketId) {
            io.to(targetSocketId).emit('callDeclined', { from: data.from });
        }
    });

    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
        delete userSocketMap[userId];
    });

})

export { app, server, io };