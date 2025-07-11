import React, { useEffect, useState } from 'react'
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import KeyboardVoiceOutlinedIcon from '@mui/icons-material/KeyboardVoiceOutlined';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import NoteOutlinedIcon from '@mui/icons-material/NoteOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedUser } from '../redux/authSlice';
import Message from '../components/message/Message';
import { setMessages, markAllAsRead } from '../redux/chatSlice';
import api from '../services/axios';

const ChatMessage = () => {
    const { user, suggestedUsers, selectedUser } = useSelector(store => store.auth);
    const { onlineUsers, messages } = useSelector(store => store.chat);
    const [input, setInput] = useState('');
    const dispatch = useDispatch();

    const sendMessageHandler = async (receiverId) => {
        try {
            const res = await api.post(`/message/send/${receiverId}`, { message: input }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setMessages([...messages, res.data.newMessage]));
                setInput('');
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (user?._id) {
            api.post('/message/markAllAsRead', { userId: user._id })
                .then(() => {
                    dispatch(markAllAsRead(user._id));
                });
        }
        return () => {
            dispatch(setSelectedUser(null));
        }
    } , [dispatch, user?._id]);
    return (
        <div className="flex w-full h-screen bg-black text-white">
            <div className="flex flex-col w-1/4 ml-[250px] border-r border-zinc-700">
                <div className="w-full p-4 space-y-6">
                    <div className="flex">
                        <div className="flex items-center mr-auto font-bold text-xl">
                            <h1>{user?.username}</h1>
                        </div>
                        <div className="flex items-center ml-auto">
                            <DriveFileRenameOutlineOutlinedIcon />
                        </div>
                    </div>
                    <div className='flex'>
                        <h1 className='flex items-center mr-auto text-sm font-semibold'>Message</h1>
                        <h1 className='flex items-center ml-auto text-sm text-zinc-400 cursor-pointer'>Requests</h1>
                    </div>
                </div>
                <div className='flex flex-col overflow-y-auto'>
                    {suggestedUsers.map((suggestedUser) => {
                        const isOnline = onlineUsers.includes(suggestedUser._id);
                        return (
                            <div key={suggestedUser._id} onClick={() => dispatch(setSelectedUser(suggestedUser))} className='flex items-center h-[60px] py-9 px-4 space-x-2 cursor-pointer hover:bg-zinc-800'>
                                <div className='flex items-center'>
                                    <img className='w-[50px] h-[50px] object-cover rounded-full' src={suggestedUser?.ProfilePicture} alt="" />
                                </div>
                                <div className='flex flex-col'>
                                    <div>{suggestedUser?.username}</div>
                                    <div className={`text-[12px] text-zinc-400`}>{isOnline ? "Astive now" : "Offline"}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="flex flex-col w-3/4">
                {
                    selectedUser ? (
                        <div className='flex flex-col w-full h-full'>
                            <header className='flex w-full mb-auto items-center border-b border-zinc-700'>
                                <div className='flex items-center h-[60px] mr-auto py-9 px-4 space-x-2 cursor-pointer'>
                                    <div className='flex items-center'>
                                        <img className='w-[40px] h-[40px] object-cover rounded-full' src={selectedUser?.ProfilePicture} alt="" />
                                    </div>
                                    <div className='flex flex-col'>
                                        <div>{selectedUser?.username}</div>
                                        <div className={`text-[12px] text-zinc-400`}>
                                            {onlineUsers.includes(selectedUser._id) ? "Astive now" : "Offline"}
                                        </div>
                                    </div>
                                </div>
                                <div className='flex items-center ml-auto px-4 space-x-4'>
                                    <CallOutlinedIcon />
                                    <VideocamOutlinedIcon />
                                    <HelpOutlineOutlinedIcon />
                                </div>
                            </header>
                            <Message selectedUser={selectedUser} />
                            <footer className='flex flex-col mt-auto p-4'>
                                <div className='flex border border-zinc-700 px-4 py-2 rounded-3xl'>
                                    <div className='flex items-center mr-auto'>
                                        <EmojiEmotionsIcon />
                                    </div>
                                    <div className='flex items-center w-full px-2'>
                                        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessageHandler(selectedUser?._id)} className='w-full bg-transparent outline-none' type="text" placeholder='Message...' />
                                    </div>
                                    {!input ?
                                        (
                                            <div className='flex items-center ml-auto space-x-2'>
                                                <KeyboardVoiceOutlinedIcon />
                                                <BrokenImageOutlinedIcon />
                                                <NoteOutlinedIcon />
                                                <FavoriteBorderOutlinedIcon />
                                            </div>
                                        ) :
                                        (
                                            <div onClick={() => sendMessageHandler(selectedUser?._id)} className='flex items-center ml-auto cursor-pointer text-blue-400'>send</div>
                                        )
                                    }

                                </div>
                            </footer>
                        </div>
                    ) : (
                        <div>hello</div>
                    )
                }
            </div>
        </div>
    )
}

export default ChatMessage
