import React, { useEffect, useState, useRef } from "react";
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

    const normalize = (arr) => arr.map((f) => (typeof f === "object" ? f : { _id: f }));

    const following = normalize(user?.following || []);
    const followers = normalize(user?.followers || []);
    const suggested = suggestedUsers || [];

    // Trả về timestamp của tin nhắn gần nhất với userId
    const getLastMessageTime = (userId) => {
        const relatedMessages = messages.filter(
            (msg) =>
                msg.senderId === userId ||
                msg.receiverId === userId
        );
        if (relatedMessages.length === 0) return 0;
        // Giả sử message có trường createdAt là ISO string hoặc timestamp
        return Math.max(...relatedMessages.map((msg) => new Date(msg.createdAt).getTime()));
    };

    let allUsers = [
        ...following,
        ...followers,
    ]
        .map((u) => {
            const full = suggested.find((s) => s._id === u._id);
            return full || u;
        })
        .filter(
            (u, index, self) =>
                u &&
                u._id &&
                index === self.findIndex((x) => x._id === u._id)
        );

    // Sắp xếp user có tin nhắn mới nhất lên đầu
    allUsers = allUsers.sort((a, b) => getLastMessageTime(b._id) - getLastMessageTime(a._id));

    const handleBack = () => {
        dispatch(setSelectedUser(null));
    };

    const handleInitiateCall = () => {
        if (!selectedUser) return;
        const url = `/call?targetUserId=${selectedUser._id}&username=${selectedUser.username}&avatar=${selectedUser.ProfilePicture}`;
        window.open(url, '_blank', 'width=800,height=600');
    }

    return (
        <div className="flex w-full h-screen bg-black text-white">
            {/* Sidebar */}
            <div className={`flex flex-col w-full md:w-80 lg:w-96 xl:w-[400px] border-r border-zinc-700 ${selectedUser ? "hidden md:flex" : "flex"} h-screen`}>
                <div className="flex-shrink-0 p-4 pt-16 space-y-6 bg-black z-10">
                    <div className="flex items-center justify-between">
                        <h1 className="font-bold text-xl text-white">@{user?.username}</h1>
                        <DriveFileRenameOutlineOutlinedIcon className="cursor-pointer text-zinc-400 hover:text-white transition-colors" />
                    </div>
                    <div className="flex items-center justify-between">
                        <h1 className="text-sm font-semibold text-white">Messages</h1>
                        <h1 className="text-sm text-zinc-400 cursor-pointer hover:text-zinc-300 transition-colors">Requests</h1>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col">
                        {allUsers.map((friendUser) => {
                            const isOnline = onlineUsers.includes(friendUser._id);
                            return (
                                <div
                                    key={friendUser._id}
                                    onClick={() => dispatch(setSelectedUser(friendUser))}
                                    className="flex items-center h-16 py-3 px-4 space-x-3 cursor-pointer hover:bg-zinc-800 transition-colors"
                                >
                                    <div className="relative">
                                        <img
                                            className="w-12 h-12 object-cover rounded-full"
                                            src={friendUser?.ProfilePicture}
                                            alt=""
                                        />
                                        {isOnline && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <div className="text-sm font-medium text-white truncate">{friendUser?.username}</div>
                                        <div className="text-xs text-zinc-400">{isOnline ? "Active now" : "Offline"}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex flex-col flex-1 h-screen min-w-0 ${selectedUser ? "flex" : "hidden md:flex"}`}>
                {selectedUser ? (
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <header className="flex-shrink-0 md:flex-shrink-0 flex items-center justify-between border-b border-zinc-700 px-4 md:px-6 py-4 h-16 bg-black z-20 md:relative fixed top-0 left-0 right-0 w-full">
                            <div className="flex items-center space-x-3 md:space-x-4 min-w-0 flex-1">
                                <button onClick={handleBack} className="md:hidden p-1 text-zinc-400 hover:text-white transition-colors flex-shrink-0">
                                    <ArrowBackIcon style={{ fontSize: 24 }} />
                                </button>
                                <div className="relative flex-shrink-0">
                                    <img
                                        className="w-10 h-10 object-cover rounded-full"
                                        src={selectedUser?.ProfilePicture}
                                        alt=""
                                    />
                                    {onlineUsers.includes(selectedUser._id) && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <div className="text-base font-semibold text-white truncate">{selectedUser?.username}</div>
                                    <div className="text-sm text-zinc-400 truncate">
                                        {onlineUsers.includes(selectedUser._id) ? "Active now" : "Offline"}
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-3 md:space-x-4 flex-shrink-0">
                                <CallOutlinedIcon style={{ fontSize: 24 }} className="cursor-pointer text-zinc-400 hover:text-white transition-colors" />
                                <VideocamOutlinedIcon
                                    style={{ fontSize: 24 }}
                                    className="cursor-pointer text-zinc-400 hover:text-white transition-colors"
                                    onClick={handleInitiateCall}
                                />
                                <HelpOutlineOutlinedIcon style={{ fontSize: 24 }} className="cursor-pointer text-zinc-400 hover:text-white transition-colors" />
                            </div>
                        </header>

                        {/* Message Area */}
                        <div className="flex-1 overflow-y-auto bg-black pt-16 md:pt-0 pb-24 md:pb-0 w-full">
                            <div className="w-full h-full">
                                <Message selectedUser={selectedUser} />
                            </div>
                        </div>

                        {/* Footer */}
                        <footer className="flex-shrink-0 md:flex-shrink-0 p-4 bg-black z-20 md:relative fixed bottom-0 left-0 right-0 w-full">
                            <div className="flex items-center w-full max-w-none border border-zinc-700 px-4 py-3 rounded-xl bg-zinc-900 shadow-md">
                                <button
                                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                                    className="flex items-center mr-3 p-1 text-zinc-400 hover:text-white transition-colors flex-shrink-0"
                                >
                                    <EmojiEmotionsIcon style={{ fontSize: 24 }} />
                                </button>
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && sendMessageHandler(selectedUser?._id)}
                                    className="flex-1 bg-transparent outline-none text-base placeholder-zinc-400 min-w-0 text-white"
                                    type="text"
                                    placeholder="Message..."
                                />
                                {!input ? (
                                    <div className="flex items-center space-x-3 flex-shrink-0">
                                        <KeyboardVoiceOutlinedIcon style={{ fontSize: 24 }} className="cursor-pointer text-zinc-400 hover:text-white transition-colors" />
                                        <BrokenImageOutlinedIcon style={{ fontSize: 24 }} className="cursor-pointer text-zinc-400 hover:text-white transition-colors" />
                                        <NoteOutlinedIcon style={{ fontSize: 24 }} className="cursor-pointer text-zinc-400 hover:text-white transition-colors" />
                                        <FavoriteBorderOutlinedIcon style={{ fontSize: 24 }} className="cursor-pointer text-zinc-400 hover:text-white transition-colors" />
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => sendMessageHandler(selectedUser?._id)}
                                        className="text-blue-400 text-base font-medium px-4 py-2 rounded hover:text-blue-300 transition-colors flex-shrink-0"
                                    >
                                        Send
                                    </button>
                                )}
                            </div>
                            {showEmojiPicker && (
                                <div className="absolute bottom-20 left-4 right-4 z-30 max-h-[40vh] overflow-y-auto md:left-auto md:right-4 md:w-80 md:bottom-full md:mb-2">
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
                        <CloudCircleOutlinedIcon style={{ fontSize: "100px" }} className="text-zinc-400 mb-4" />
                        <h1 className="text-xl font-normal text-white mb-2">Your messages</h1>
                        <p className="text-sm text-zinc-400">Send a message to start a chat.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;