import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Hoặc useHistory nếu dùng React Router v5
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
import EmojiPicker from "emoji-picker-react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../redux/authSlice";
import Message from "../components/message/Message";
import { setMessages, markAllAsRead } from "../redux/chatSlice";
import api from "../services/axios";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Icon cho nút Back

const ChatMessage = () => {
    const { user, suggestedUsers, selectedUser } = useSelector((store) => store.auth);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { onlineUsers, messages } = useSelector((store) => store.chat);
    const [input, setInput] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Sử dụng để điều hướng

    const handleEmojiClick = (emojiData) => {
        setInput((prev) => prev + emojiData.emoji);
    };

    const sendMessageHandler = async (receiverId) => {
        try {
            const res = await api.post(`/message/send/${receiverId}`, { message: input }, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            if (res.data.success) {
                dispatch(setMessages([...messages, res.data.newMessage]));
                setInput("");
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

    const following = user?.following || [];
    const followers = user?.followers || [];
    const normalize = (arr) => arr.map((f) => (typeof f === "object" ? f : { _id: f }));
    const allUsers = [
        ...normalize(following),
        ...normalize(followers),
    ].filter((user, index, self) => user && user._id && index === self.findIndex((u) => u._id === user._id));

    const handleBack = () => {
        dispatch(setSelectedUser(null));
    };

    return (
        <div className="flex flex-col md:flex-row w-full h-screen bg-black text-white">
            <div className="flex flex-col w-full md:w-1/4 ml-0 md:ml-[250px] border-r border-zinc-700 h-full md:h-auto">
                <div className="w-full p-4 space-y-6">
                    <div className="flex">
                        <div className="flex items-center mr-auto font-bold text-xl">
                            <h1>{user?.username}</h1>
                        </div>
                        <div className="flex items-center ml-auto">
                            <DriveFileRenameOutlineOutlinedIcon />
                        </div>
                    </div>
                    <div className="flex">
                        <h1 className="flex items-center mr-auto text-sm font-semibold">Message</h1>
                        <h1 className="flex items-center ml-auto text-sm text-zinc-400 cursor-pointer">Requests</h1>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {allUsers.map((friendUser) => {
                        const isOnline = onlineUsers.includes(friendUser._id);
                        return (
                            <div
                                key={friendUser._id}
                                onClick={() => dispatch(setSelectedUser(friendUser))}
                                className="flex items-center h-[60px] py-2 px-4 space-x-2 cursor-pointer hover:bg-zinc-800"
                            >
                                <div className="flex items-center">
                                    <img
                                        className="w-[40px] md:w-[50px] h-[40px] md:h-[50px] object-cover rounded-full"
                                        src={friendUser?.ProfilePicture}
                                        alt=""
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <div>{friendUser?.username}</div>
                                    <div className={`text-[12px] text-zinc-400`}>{isOnline ? "Active now" : "Offline"}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {selectedUser && (
                <div
                    className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center md:hidden"
                    style={{ paddingTop: "env(safe-area-inset-top, 0)" }}
                >
                    <div className="flex flex-col w-full h-full bg-black">
                        <header className="flex w-full mb-auto items-center border-b border-zinc-700">
                            <div className="flex items-center h-[60px] mr-auto py-2 px-4 space-x-2">
                                <button onClick={handleBack} className="flex items-center mr-2">
                                    <ArrowBackIcon style={{ fontSize: 24 }} />
                                </button>
                                <div className="flex items-center">
                                    <img
                                        className="w-[30px] h-[30px] object-cover rounded-full"
                                        src={selectedUser?.ProfilePicture}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <div>{selectedUser?.username}</div>
                                    <div className={`text-[12px] text-zinc-400`}>
                                        {onlineUsers.includes(selectedUser._id) ? "Active now" : "Offline"}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center ml-auto px-2 space-x-2">
                                <CallOutlinedIcon />
                                <VideocamOutlinedIcon />
                                <HelpOutlineOutlinedIcon />
                            </div>
                        </header>
                        <div className="flex-1 w-full h-full">
                            <Message selectedUser={selectedUser} />
                        </div>
                        <footer className="flex flex-col mt-auto p-2">
                            <div className="flex border border-zinc-700 px-2 py-1 rounded-3xl">
                                <div onClick={() => setShowEmojiPicker((prev) => !prev)} className="flex items-center mr-auto">
                                    <EmojiEmotionsIcon style={{ fontSize: 20 }} />
                                </div>
                                <div className="flex items-center w-full px-1">
                                    <input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && sendMessageHandler(selectedUser?._id)}
                                        className="w-full bg-transparent outline-none text-sm"
                                        type="text"
                                        placeholder="Message..."
                                    />
                                </div>
                                {!input ? (
                                    <div className="flex items-center ml-auto space-x-1">
                                        <KeyboardVoiceOutlinedIcon style={{ fontSize: 20 }} />
                                        <BrokenImageOutlinedIcon style={{ fontSize: 20 }} />
                                        <NoteOutlinedIcon style={{ fontSize: 20 }} />
                                        <FavoriteBorderOutlinedIcon style={{ fontSize: 20 }} />
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => sendMessageHandler(selectedUser?._id)}
                                        className="flex items-center ml-auto cursor-pointer text-blue-400 text-sm"
                                    >
                                        send
                                    </div>
                                )}
                                {showEmojiPicker && (
                                    <div className="absolute bottom-[60px] z-50 shadow-lg">
                                        <EmojiPicker
                                            onEmojiClick={handleEmojiClick}
                                            theme="dark"
                                            height={350}
                                        />
                                    </div>
                                )}
                            </div>
                        </footer>
                    </div>
                </div>
            )}
            <div className="flex flex-col w-full md:w-3/4 h-full md:block">
                {selectedUser ? (
                    <div className="flex flex-col w-full h-full">
                        <header className="flex w-full mb-auto items-center border-b border-zinc-700">
                            <div className="flex items-center h-[60px] mr-auto py-2 px-4 space-x-2 cursor-pointer">
                                <div className="flex items-center">
                                    <img
                                        className="w-[30px] md:w-[40px] h-[30px] md:h-[40px] object-cover rounded-full"
                                        src={selectedUser?.ProfilePicture}
                                        alt=""
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <div>{selectedUser?.username}</div>
                                    <div className={`text-[12px] text-zinc-400`}>
                                        {onlineUsers.includes(selectedUser._id) ? "Active now" : "Offline"}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center ml-auto px-2 md:px-4 space-x-2 md:space-x-4">
                                <CallOutlinedIcon />
                                <VideocamOutlinedIcon />
                                <HelpOutlineOutlinedIcon />
                            </div>
                        </header>
                        <div className="flex-1 w-full h-full">
                            <Message selectedUser={selectedUser} />
                        </div>
                        <footer className="flex flex-col mt-auto p-2 md:p-4">
                            <div className="flex border border-zinc-700 px-2 md:px-4 py-1 md:py-2 rounded-3xl">
                                <div onClick={() => setShowEmojiPicker((prev) => !prev)} className="flex items-center mr-auto">
                                    <EmojiEmotionsIcon style={{ fontSize: 20 }} />
                                </div>
                                <div className="flex items-center w-full px-1 md:px-2">
                                    <input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && sendMessageHandler(selectedUser?._id)}
                                        className="w-full bg-transparent outline-none text-sm md:text-base"
                                        type="text"
                                        placeholder="Message..."
                                    />
                                </div>
                                {!input ? (
                                    <div className="flex items-center ml-auto space-x-1 md:space-x-2">
                                        <KeyboardVoiceOutlinedIcon style={{ fontSize: 20 }} />
                                        <BrokenImageOutlinedIcon style={{ fontSize: 20 }} />
                                        <NoteOutlinedIcon style={{ fontSize: 20 }} />
                                        <FavoriteBorderOutlinedIcon style={{ fontSize: 20 }} />
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => sendMessageHandler(selectedUser?._id)}
                                        className="flex items-center ml-auto cursor-pointer text-blue-400 text-sm md:text-base"
                                    >
                                        send
                                    </div>
                                )}
                                {showEmojiPicker && (
                                    <div className="absolute bottom-[60px] z-50 shadow-lg">
                                        <EmojiPicker
                                            onEmojiClick={handleEmojiClick}
                                            theme="dark"
                                            height={350}
                                        />
                                    </div>
                                )}
                            </div>
                        </footer>
                    </div>
                ) : (
                    <div className="flex-col items-center justify-center h-full hidden">
                        <CloudCircleOutlinedIcon style={{ fontSize: "100px md:130px" }} />
                        <h1 className="text-xl md:text-2xl font-normal">Your messages</h1>
                        <p className="text-zinc-400 text-sm md:text-base">Send a message to start a chat.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;