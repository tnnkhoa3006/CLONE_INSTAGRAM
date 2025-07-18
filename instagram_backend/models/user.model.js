import mongoose, { Schema as _Schema, model } from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    ProfilePicture: { type: String, default: "https://res.cloudinary.com/dan2u3wbc/image/upload/v1752587732/founder_ajyfts.jpg" },
    bio: { type: String, default: "" },
    gender: { type: String, enum: ["male", "female", "other"], default: "other" },
    followers: [{ type: _Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: _Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: _Schema.Types.ObjectId, ref: "Post" }],
    bookmarks: [{ type: _Schema.Types.ObjectId, ref: "Post" }],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, { timestamps: true });

export default model("User", userSchema);