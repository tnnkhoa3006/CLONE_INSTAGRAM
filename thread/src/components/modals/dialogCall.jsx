import React from 'react'
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

const DialogCall = ({ isOpen, onAccept, onDecline, callerName, callerAvatar }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-[60]">
            <div className='w-[90%] max-w-md bg-zinc-800 rounded-2xl p-6'>
                <div className='flex flex-col items-center justify-center'>
                    <img 
                        src={callerAvatar} 
                        className='w-20 h-20 rounded-full mb-4 object-cover' 
                        alt={callerName}
                    />
                    <h1 className='text-white text-xl font-bold'>{callerName}</h1>
                    <p className='text-gray-400 text-sm mt-1'>Incoming video call...</p>
                    
                    <div className='flex justify-center gap-8 mt-8'>
                        <button
                            onClick={onDecline}
                            className='p-4 bg-red-500 rounded-full hover:bg-red-600 transition'
                        >
                            <CloseRoundedIcon className='text-white' />
                        </button>
                        <button
                            onClick={onAccept}
                            className='p-4 bg-green-500 rounded-full hover:bg-green-600 transition'
                        >
                            <VideocamRoundedIcon className='text-white' />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DialogCall
