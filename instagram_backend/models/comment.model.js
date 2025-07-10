import { Schema, model } from "mongoose";

const commentSchema = new Schema({
    author: {type: Schema.Types.ObjectId, ref: "User", required: true},
    post: {type: Schema.Types.ObjectId, ref: "Post", required: true},
    text: {type: String, required: true},
}, {timestamps: true});

export default model("Comment", commentSchema);