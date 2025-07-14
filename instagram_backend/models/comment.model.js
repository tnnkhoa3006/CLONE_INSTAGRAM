import { Schema, model } from "mongoose";

const commentSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    text: { type: String, required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null }, // Thêm dòng này
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }], // Thêm dòng này
}, { timestamps: true });

export default model("Comment", commentSchema);