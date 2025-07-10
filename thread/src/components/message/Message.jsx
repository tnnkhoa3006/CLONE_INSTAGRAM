import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useGetAllMessage from '../../hooks/useGetAllMessage'
import useGetRTM from '../../hooks/useGetRTM'

const Message = ({ selectedUser }) => {
    const { messages } = useSelector(store => store.chat);
    const { user } = useSelector(store => store.auth);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className='overflow-y-auto h-full'>
            <div className='flex flex-col items-center py-9 px-4 space-y-2'>
                <img className='w-[80px] h-[80px] object-cover rounded-full' src={selectedUser?.ProfilePicture} />
                <div className='flex flex-col items-center'>
                    <div className='font-semibold text-xl'>{selectedUser?.username}</div>
                    <div className='text-sm text-zinc-400'>Instagram</div>
                </div>
                <div className='flex flex-col items-center rounded-xl bg-zinc-700 px-3 py-1 hover:bg-zinc-600'>
                    <Link to={`/profile/${selectedUser?._id}`}>
                        <button className='text-sm'>View profile</button>
                    </Link>
                </div>
            </div>

            <div className='px-4 space-y-1'>
                {messages && messages.map((msg) => (
                    <div key={msg._id} className={`flex ${msg.senderId === user._id ? 'justify-end' : 'justify-start'} mb-2`}>
                        <div className={`mx-2 px-4 py-1 rounded-xl ${msg.senderId === user._id ? 'bg-blue-700' : 'bg-zinc-600'}`}>
                            {msg.message}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    )
}

export default Message
