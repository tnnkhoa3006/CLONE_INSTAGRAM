import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    messageType: {
        type: String,
        enum: ['text', 'call'],
        default: 'text',
    },
    isRead: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

export default Message;