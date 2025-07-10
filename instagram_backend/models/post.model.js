import { Schema, model } from "mongoose";

const postSchema = new Schema({
    author: {type: Schema.Types.ObjectId, ref: "User", required: true},
    image: {type: String, required: true},
    caption: {type: String, default: ""},
    likes: [{type: Schema.Types.ObjectId, ref: "User"}],
    comments: [{type: Schema.Types.ObjectId, ref: "Comment"}],
}, {timestamps: true});

export default model("Post", postSchema);