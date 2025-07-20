import React, { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import api from "../../services/axios";
import { Link } from "react-router-dom";
dayjs.extend(relativeTime);

const CommentBox = ({ comment, onReply, user }) => {
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
    <div className="flex items-start py-1 md:py-2 group hover:bg-zinc-800 rounded-lg transition relative">
      {/* Avatar */}
      <Link to={`/profile/${comment?.author?._id}`}>
        <img
          className="w-10 h-10 md:w-[40px] md:h-[40px] object-cover rounded-full mt-0.5 md:mt-1 mr-2 md:mr-3 border border-zinc-700"
          src={comment?.author?.ProfilePicture}
          alt="avatar"
          onError={(e) => (e.target.src = "/default-avatar.png")}
        />
      </Link>
      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap">
          <Link to={`/profile/${comment?.author?._id}`}>
            <span className="font-bold text-white text-sm md:text-sm cursor-pointer hover:underline mr-1 md:mr-2">
              {comment?.author?.username}
            </span>
          </Link>
          <span className="text-xs md:text-sm text-gray-200 break-words">
            {comment?.text}
          </span>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4 mt-0.5 md:mt-1 text-xs md:text-xs text-gray-400">
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
      <button className="ml-1 md:ml-2 mt-0.5 md:mt-1 opacity-70 hover:opacity-100" onClick={handleLike}>
        {isLiked ? (
          <FavoriteIcon fontSize="small" className="text-red-600" />
        ) : (
          <FavoriteBorderIcon fontSize="small" className="text-gray-400" />
        )}
      </button>
    </div>
  );
};

export default CommentBox;