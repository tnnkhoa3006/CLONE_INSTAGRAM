import React, { useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import api from '../../services/axios';
dayjs.extend(relativeTime);

const CommentBox = ({ comment, onReply, user }) => {
    const userId = user?._id;
    const [isLiked, setIsLiked] = useState(user && comment.likes?.includes(user._id));
    const [likeCount, setLikeCount] = useState(comment.likes?.length || 0);

    const handleLike = async () => {
        try {
            if (isLiked) {
                const res = await api.post(`/post/comment/${comment._id}/unlike`, {}, { withCredentials: true });
                setIsLiked(false);
                setLikeCount(res.data.likes.length);
            } else {
                const res = await api.post(`/post/comment/${comment._id}/like`, {}, { withCredentials: true });
                setIsLiked(true);
                setLikeCount(res.data.likes.length);
            }
        } catch (err) {
            // handle error
        }
    };

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
                        {likeCount} likes
                    </span>
                    <span
                        className="cursor-pointer hover:underline"
                        onClick={() => onReply && onReply(comment.author.username, comment._id)}
                    >
                        Reply
                    </span>
                    <span className="cursor-pointer">•••</span>
                </div>
            </div>
            {/* Heart icon (right) */}
            <button className="ml-2 mt-1 opacity-70 hover:opacity-100" onClick={handleLike}>
                {isLiked ? (
                    <FavoriteIcon fontSize="small" className="text-red-600" />
                ) : (
                    <FavoriteBorderIcon fontSize="small" className="text-gray-400" />
                )}
            </button>
        </div>
    )
}

export default CommentBox;
