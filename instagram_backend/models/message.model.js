import { Schema, model } from "mongoose";

const messageSchema = new Schema({
    senderId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    receiverId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    message: {type: String, required: true},
    read: {type: Boolean, required: true, default: false},
}, {timestamps: true});

export default model("Message", messageSchema);