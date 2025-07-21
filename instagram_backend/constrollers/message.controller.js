import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const {message} = req.body;

        let conversation = await Conversation.findOne({
            participants: {$all: [senderId, receiverId]}
        });

        if (!conversation) { 
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        });

        if (newMessage) conversation.messages.push(newMessage._id);
        await Promise.all([conversation.save(), newMessage.save()]);

        // soket.io realtime message sending
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        return res.status(200).json({
            message: "Message sent successfully",
            success: true,
            newMessage
        })
    } catch (error) {
        console.log(error);
    }
}

export const getMessages = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        
        const conversation = await Conversation.findOne({
            participants: {$all: [senderId, receiverId]}
        }).populate("messages");

        if (!conversation) {
            return res.status(200).json({
                messages:[],
                success: true
            })
        }
        return res.status(200).json({
            messages: conversation.messages,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.body;
        await Message.updateMany(
            { receiverId: userId, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const logCall = async (req, res) => {
    try {
        const { receiverId, duration } = req.body;
        const senderId = req.id;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }
        
        const newMessage = new Message({
            senderId,
            receiverId,
            message: duration,
            messageType: 'call',
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }

        await Promise.all([conversation.save(), newMessage.save()]);

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        
        const senderSocketId = getReceiverSocketId(senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit("newMessage", newMessage);
        }

        return res.status(201).json({ success: true, message: "Call logged successfully", newMessage });

    } catch (error) {
        console.log("Error in logCall controller:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getAllMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        
        const conversation = await Conversation.findOne({
            participants: {$all: [senderId, receiverId]}
        }).populate("messages");

        if (!conversation) {
            return res.status(200).json({
                messages:[],
                success: true
            })
        }
        return res.status(200).json({
            messages: conversation.messages,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}