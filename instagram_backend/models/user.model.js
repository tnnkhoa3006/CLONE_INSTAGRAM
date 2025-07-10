import mongoose, { Schema as _Schema, model } from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    ProfilePicture: {type: String, default: "https://bookvexe.vn/wp-content/uploads/2023/04/chon-loc-25-avatar-facebook-mac-dinh-chat-nhat_1.jpg"},
    bio:{type: String, default: ""},
    gender:{type: String, enum: ["male", "female", "other"], default: "other"},
    followers: [{type: _Schema.Types.ObjectId, ref: "User"}],
    following: [{type: _Schema.Types.ObjectId, ref: "User"}],
    posts: [{type: _Schema.Types.ObjectId, ref: "Post"}],
    bookmarks: [{type: _Schema.Types.ObjectId, ref: "Post"}],
}, {timestamps: true});

export default model("User", userSchema);