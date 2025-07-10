import React from 'react'

const CommentBox = ({comment}) => {
    return (
        <div>
            <div className="flex items-center py-[10px] space-x-[10px]">
                <img
                    className="w-10 h-10 object-cover rounded-full border-[3px] border-r-pink-500 border-b-purple-400 border-l-yellow-400 border-t-orange-400 cursor-pointer"
                    src={comment?.author?.ProfilePicture}
                    alt="avatar"
                />
                <div className="text-[12px] items-center font-semibold leading-relaxed">
                    <span className="font-semibold cursor-pointer">{comment?.author?.username}</span>{' '}
                    <span className='font-normal'>{comment?.text}</span>
                </div>
            </div>
        </div>
    )
}

export default CommentBox
