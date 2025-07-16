import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Message = ({ selectedUser }) => {
    const { messages } = useSelector(store => store.chat);
    const { user } = useSelector(store => store.auth);
    const bottomRef = useRef(null);

    // State loading
    const [loading, setLoading] = useState(true);

    // Giả lập loading: mỗi khi selectedUser hoặc messages thay đổi, loading 1s
    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [selectedUser]);

    // Skeleton loading UI
    const Skeleton = () => (
        <div className="flex flex-col items-center py-9 px-4 space-y-2 animate-pulse">
            <div className="w-[80px] h-[80px] bg-zinc-700 rounded-full" />
            <div className="h-6 w-32 bg-zinc-700 rounded" />
            <div className="h-4 w-16 bg-zinc-700 rounded" />
            <div className="h-8 w-24 bg-zinc-700 rounded-xl" />
        </div>
    );

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    return (
        <div className='overflow-y-auto h-full'>
            {loading ? (
                <Skeleton />
            ) : (
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
            )}

            <div className='px-4 space-y-1'>
                {loading ? (
                    Array(5).fill(0).map((_, idx) => (
                        <div key={idx} className="flex mb-2">
                            <div className="mx-2 px-8 py-3 rounded-xl bg-zinc-700 animate-pulse" />
                        </div>
                    ))
                ) : (
                    messages?.filter(Boolean).map((msg, idx) => (
                        <div
                            key={msg._id}
                            className={`flex ${msg.senderId === user._id ? 'justify-end' : 'justify-start'} mb-2`}
                        >
                            <div
                                className={`mx-2 px-4 py-1 rounded-xl transition-all duration-300 opacity-0 animate-fadeIn
                                    ${msg.senderId === user._id ? 'bg-blue-700' : 'bg-zinc-600'}`}
                                style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'forwards' }}
                            >
                                {msg.message}
                            </div>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    )
}

export default Message