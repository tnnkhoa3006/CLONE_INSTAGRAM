import React from 'react'
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
dayjs.extend(relativeTime);

const CommentBox = ({ comment }) => {
    return (
        <div className="flex items-start py-2 group hover:bg-zinc-800 rounded-lg transition relative">
            {/* Avatar */}
            <img
                className="w-[40px] h-[40px] object-cover rounded-full mt-1 mr-3 border border-zinc-700"
                src={comment?.author?.ProfilePicture}
                alt="avatar"
            />
            {/* Main content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap">
                    <span className="font-bold text-white text-sm cursor-pointer hover:underline mr-2">
                        {comment?.author?.username}
                    </span>
                    <span className="text-sm text-gray-200 break-words">
                        {comment?.text}
                    </span>
                </div>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                    <span>{dayjs(comment?.createdAt).fromNow(true)}</span>
                    <span className="font-medium cursor-pointer hover:underline">
                        {comment?.likes ? `${comment.likes.length} likes` : '4 likes'}
                    </span>
                    <span className="cursor-pointer hover:underline">Reply</span>
                    <span className="cursor-pointer">•••</span>
                </div>
            </div>
            {/* Heart icon (right) */}
            <button className="ml-2 mt-1 opacity-70 hover:opacity-100">
                <FavoriteBorderIcon fontSize="small" className="text-gray-400 hover:text-red-500" />
            </button>
        </div>
    )
}

export default CommentBox
