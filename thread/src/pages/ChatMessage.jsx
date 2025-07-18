import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import KeyboardVoiceOutlinedIcon from "@mui/icons-material/KeyboardVoiceOutlined";
import BrokenImageOutlinedIcon from "@mui/icons-material/BrokenImageOutlined";
import NoteOutlinedIcon from "@mui/icons-material/NoteOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import CloudCircleOutlinedIcon from "@mui/icons-material/CloudCircleOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiPicker from "emoji-picker-react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../redux/authSlice";
import { setMessages, markAllAsRead } from "../redux/chatSlice";
import api from "../services/axios";
import Message from "../components/message/Message";

const ChatMessage = () => {
    const { user, suggestedUsers, selectedUser } = useSelector((store) => store.auth);
    const { onlineUsers, messages } = useSelector((store) => store.chat);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [input, setInput] = useState("");
    const dispatch = useDispatch();
    const inputRef = useRef(null);

    const handleEmojiClick = (emojiData) => {
        setInput((prev) => prev + emojiData.emoji);
        inputRef.current?.focus();
    };

    const sendMessageHandler = async (receiverId) => {
        try {
            const res = await api.post(
                `/message/send/${receiverId}`,
                { message: input },
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );
            if (res.data.success) {
                dispatch(setMessages([...messages, res.data.newMessage]));
                setInput("");
                setShowEmojiPicker(false);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (user?._id) {
            api.post("/message/markAllAsRead", { userId: user._id }).then(() => {
                dispatch(markAllAsRead(user._id));
            });
        }
        return () => {
            dispatch(setSelectedUser(null));
        };
    }, [dispatch, user?._id]);

    // Chuẩn hoá list user theo object { _id, ... }
    const normalize = (arr) =>
        arr.map((f) => (typeof f === "object" ? f : { _id: f }));

    // Xử lý theo danh sách suggestedUsers nếu đã có thông tin user đầy đủ
    const following = normalize(user?.following || []);
    const followers = normalize(user?.followers || []);
    const suggested = suggestedUsers || [];

    // Gộp lại danh sách người cần hiển thị
    const allUsers = [
        ...following,
        ...followers,
    ]
        .map((u) => {
            // Tìm lại thông tin từ suggestedUsers nếu có (để có profile picture, username...)
            const full = suggested.find((s) => s._id === u._id);
            return full || u;
        })
        .filter(
            (u, index, self) =>
                u &&
                u._id &&
                index === self.findIndex((x) => x._id === u._id)
        );

    return (
        <div className="flex flex-col md:flex-row w-full h-screen bg-black text-white">
            {/* Sidebar (Hidden on Mobile when Chat is Active) */}
            <div className={`flex flex-col w-full md:w-1/3 lg:w-1/4 border-r border-zinc-700 ${selectedUser ? "hidden md:flex" : "flex"} h-[100dvh] min-h-0`}>
                {/* Header cố định */}
                <div className="p-4 pt-16 space-y-6 flex-shrink-0 bg-black z-10">
                    <div className="flex items-center justify-between">
                        <h1 className="font-bold text-xl">@{user?.username}</h1>
                        <DriveFileRenameOutlineOutlinedIcon className="cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between">
                        <h1 className="text-sm font-semibold">Messages</h1>
                        <h1 className="text-sm text-zinc-400 cursor-pointer">Requests</h1>
                    </div>
                </div>

                {/* Danh sách user scrollable */}
                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col">
                        {allUsers.map((friendUser) => {
                            const isOnline = onlineUsers.includes(friendUser._id);
                            return (
                                <div
                                    key={friendUser._id}
                                    onClick={() => dispatch(setSelectedUser(friendUser))}
                                    className="flex items-center h-14 py-2 px-4 space-x-2 cursor-pointer hover:bg-zinc-800 transition-colors"
                                >
                                    <img
                                        className="w-10 h-10 object-cover rounded-full"
                                        src={friendUser?.ProfilePicture}
                                        alt=""
                                    />
                                    <div className="flex flex-col">
                                        <div className="text-sm">{friendUser?.username}</div>
                                        <div className="text-xs text-zinc-400">{isOnline ? "Active now" : "Offline"}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {/* Chat Area (Full-Screen on Mobile) */}
            <div className={`flex flex-col w-full h-screen ${selectedUser ? "flex" : "hidden md:flex"}`}>
                {selectedUser ? (
                    <div className="flex flex-col w-full h-full">
                        {/* Header */}
                        <header className="flex w-full fixed items-center justify-between border-b border-zinc-700 px-3 py-2 h-14 bg-black z-20">
                            <div className="flex items-center space-x-2">
                                <button onClick={handleBack} className="md:hidden p-1">
                                    <ArrowBackIcon style={{ fontSize: 24 }} />
                                </button>
                                <img
                                    className="w-8 h-8 object-cover rounded-full"
                                    src={selectedUser?.ProfilePicture}
                                />
                                <div className="flex flex-col">
                                    <div className="text-sm font-semibold">{selectedUser?.username}</div>
                                    <div className="text-xs text-zinc-400">
                                        {onlineUsers.includes(selectedUser._id) ? "Active now" : "Offline"}
                                    </div>
                                </div>
                            </div>
                            <div className="flex ml-auto space-x-3 pr-2">
                                <CallOutlinedIcon style={{ fontSize: 20 }} className="cursor-pointer" />
                                <VideocamOutlinedIcon style={{ fontSize: 20 }} className="cursor-pointer" />
                                <HelpOutlineOutlinedIcon style={{ fontSize: 20 }} className="cursor-pointer" />
                            </div>
                        </header>

                        {/* Message Area */}
                        <div className="flex-1 overflow-y-auto border-[1px]">
                            <Message selectedUser={selectedUser} />
                        </div>

                        {/* Footer */}
                        <footer className="w-full fixed bottom-0 p-3 bg-black z-20 safe-area-padding">
                            <div className="flex items-center border border-zinc-700 px-3 py-2 rounded-full bg-zinc-900 shadow-md">
                                <button
                                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                                    className="flex items-center mr-2 p-1"
                                >
                                    <EmojiEmotionsIcon style={{ fontSize: 20 }} />
                                </button>
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && sendMessageHandler(selectedUser?._id)}
                                    className="flex-1 bg-transparent outline-none text-sm placeholder-zinc-400"
                                    type="text"
                                    placeholder="Message..."
                                />
                                {!input ? (
                                    <div className="flex items-center space-x-2">
                                        <KeyboardVoiceOutlinedIcon style={{ fontSize: 20 }} className="cursor-pointer" />
                                        <BrokenImageOutlinedIcon style={{ fontSize: 20 }} className="cursor-pointer" />
                                        <NoteOutlinedIcon style={{ fontSize: 20 }} className="cursor-pointer" />
                                        <FavoriteBorderOutlinedIcon style={{ fontSize: 20 }} className="cursor-pointer" />
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => sendMessageHandler(selectedUser?._id)}
                                        className="text-blue-400 text-sm font-medium px-2"
                                    >
                                        Send
                                    </button>
                                )}
                            </div>
                            {showEmojiPicker && (
                                <div className="absolute bottom-16 left-3 right-3 z-30">
                                    <EmojiPicker
                                        onEmojiClick={handleEmojiClick}
                                        theme="dark"
                                        height={350}
                                        width="100%"
                                        previewConfig={{ showPreview: false }}
                                    />
                                </div>
                            )}
                        </footer>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                        <CloudCircleOutlinedIcon style={{ fontSize: "80px md:100px" }} className="text-zinc-400" />
                        <h1 className="text-lg md:text-xl font-normal">Your messages</h1>
                        <p className="text-sm text-zinc-400">Send a message to start a chat.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;