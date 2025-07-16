import { Schema, model } from "mongoose";

const postSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    mediaUrl: { type: String, required: true },
    caption: { type: String, default: "" },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    mediaType: { type: String, enum: ['image', 'video'], required: true },
    mediaPublicId: { type: String }
}, { timestamps: true });

export default model("Post", postSchema);