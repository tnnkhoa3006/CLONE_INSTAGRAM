// components/PostCard.jsx
import { useState, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ModeCommentOutlinedIcon from "@mui/icons-material/ModeCommentOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import TurnedInNotIcon from "@mui/icons-material/TurnedInNot";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Dialogmore_option from "../modals/dialogmore_option";
import Dialogcomment from "../modals/dialogcomment";
import { useDispatch, useSelector } from "react-redux";
import { setPosts, setSelectedPost } from "../../redux/postSlice.js";
import axios from "axios";
import { toast } from "react-hot-toast";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

function getInstagramTime(dateString) {
  const now = new Date();
  const postDate = new Date(dateString);
  const diff = (now - postDate) / 1000; // seconds

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  if (diff < 2419200) return `${Math.floor(diff / 604800)}w`;
  return postDate.toLocaleDateString();
}

const PostCard = ({ postId }) => {
  const [text, setText] = useState("");
  const { user } = useSelector(store => store.auth);
  const { posts } = useSelector(store => store.post);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const dispatch = useDispatch();

  // Lấy post từ Redux store thay vì từ prop
  const post = posts.find(p => p._id === postId);

  // Tính toán liked và postLikes từ post hiện tại
  const liked = post?.likes?.includes(user?._id) || false;
  const postLikes = post?.likes?.length || 0;
  const saved = post?.isBookmarked || false;

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const likeOrDislikeHandler = async () => {
    try {
      const action = liked ? 'dislike' : 'like';
      const res = await axios.post(`/post/${post._id}/${action}`, {}, { withCredentials: true });
      if (res.data.success) {
        const updatedPostData = posts.map(p =>
          p._id === post._id ? {
            ...p,
            likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
          } : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const commentHandler = async () => {
    try {
      if (!text.trim()) {
        return toast.error("Bạn chưa nhập nội dung bình luận");
      }
      const res = await axios.post(`/post/${post._id}/comment`, { text },
        {
          headers: {
            'Content-Type': 'application/json'
          }, withCredentials: true
        }
      );
      if (res.data.success) {
        const currentPost = posts.find(p => p._id === post._id);
        const updateCommentData = [...(currentPost?.comments || []), res.data.comment];

        const updatePostData = posts.map(p =>
          p._id === post._id ? {
            ...p,
            comments: updateCommentData
          } : p
        );
        dispatch(setPosts(updatePostData));
        toast.success(res.data.message);
        setText('');
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const bookMarkHandler = async () => {
    try {
      const res = await axios.post(`/post/${postId}/bookmark`, {}, { withCredentials: true });
      if (res.data.success) {
        const updatedPosts = posts.map(p =>
          p._id === post._id
            ? { ...p, isBookmarked: !saved }
            : p
        );
        dispatch(setPosts(updatedPosts));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
    }
  }

  // Nếu không có post, return null
  if (!post) return null;

  return (
    <div className="w-[560px] bg-black text-white space-y-2">
      {/* Header */}
      <div className="w-full h-[50px] flex items-center pl-[80px] space-x-[5px]">
        <img
          className="w-[40px] h-[40px] object-cover rounded-full border-[3px] border-r-pink-500 border-b-purple-400 border-l-yellow-400 border-t-orange-400 cursor-pointer"
          src={post?.author.ProfilePicture}
          alt="avatar"
        />
        <div className="inline-flex text-[12px] h-[20px] items-center font-semibold cursor-pointer">{post.author.username}</div>
        <div className="flex w-[80px] h-[20px] space-x-[3px]">
          <div className="text-gray-400 text-[12px] w-[5px] h-[5px] font-extrabold">•</div>
          <div className="text-gray-400 text-[12px] w-[50px] h-[20px] pt-[1.5px] cursor-pointer">
            {dayjs(post.createdAt).fromNow(true)}
          </div>
        </div>
        <MoreHorizIcon
          onClick={() => setShowOptions(true)}
          titleAccess="More options"
          style={{ fontSize: 22, marginLeft: 'auto', cursor: 'pointer' }}
        />
      </div>

      {/* Image */}
      <div className="w-full pl-[80px]">
        <img className="w-full object-cover rounded" src={post.image} alt="post" />
        <div className="flex w-full h-[50px] text-[14px] space-x-[10px] items-center">
          {
            liked ? (<FavoriteRoundedIcon titleAccess="Like" onClick={likeOrDislikeHandler} style={{ fontSize: 27, cursor: 'pointer', color: 'red' }} />)
              : (<FavoriteBorderRoundedIcon className="hover:text-gray-400" titleAccess="Like" onClick={likeOrDislikeHandler} style={{ fontSize: 27, cursor: 'pointer' }} />)
          }
          <ModeCommentOutlinedIcon
            onClick={() => {
              dispatch(setSelectedPost(post));
              setShowComment(true)
            }}
            titleAccess="Comment"
            className="hover:text-gray-400"
            style={{ fontSize: 27, cursor: 'pointer' }}
          />
          <ShareOutlinedIcon titleAccess="Share" className="hover:text-gray-400" style={{ fontSize: 27, cursor: 'pointer' }} />
          {
            saved
              ? (<BookmarkIcon titleAccess="Save" onClick={bookMarkHandler} style={{ fontSize: 27, cursor: 'pointer', color: 'white', marginLeft: 'auto' }} />)
              : (<TurnedInNotIcon titleAccess="Save" onClick={bookMarkHandler} className="hover:text-gray-400" style={{ fontSize: 27, cursor: 'pointer', marginLeft: 'auto' }} />)
          }
        </div>
      </div>

      {/* Content */}
      <div className="w-full pl-[80px] space-y-[5px]">
        <div className="flex w-full h-[35px]">
          <div className="inline-flex h-[35px] text-[14px] items-center font-semibold cursor-pointer">{postLikes} likes</div>
        </div>

        <div className="w-full text-sm font-normal leading-relaxed">
          <span alt="username" className="font-semibold text-sm cursor-pointer">{post.author.username}</span>{' '}
          {post.caption}
        </div>
        {
          post.comments && post.comments.length > 0 && (
            <div onClick={() => {
              dispatch(setSelectedPost(post));
              setShowComment(true)
            }}
              className="w-full text-[15px] text-gray-400 cursor-pointer">View all {post.comments.length} comments
            </div>
          )
        }

        {/* Comment box */}
        <div className="flex w-full">
          <textarea
            className="w-[490px] bg-black text-white outline-none resize-none hide-scrollbar"
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {text.trim().length > 0 && (
            <div className="w-[45px] h-[30px] flex items-center justify-center">
              <button onClick={commentHandler} className="text-sm font-semibold text-blue-500">Post</button>
            </div>
          )}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(prev => !prev)}
              className="text-sm font-semibold"
            >
              <EmojiEmotionsIcon titleAccess="Emoji" className="hover:text-gray-400" style={{ fontSize: 20, cursor: 'pointer' }} />
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-[40px] right-0 z-50 shadow-lg">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme="dark"
                  height={350}
                />
              </div>
            )}
          </div>
        </div>
        <div className="w-[480px] border-b border-gray-700 mx-auto" />
      </div>
      {/* More options */}
      <Dialogmore_option isOpen={showOptions} onClose={() => setShowOptions(false)} post={post} />
      <Dialogcomment isopen={showComment} onClose={() => setShowComment(false)} post={post} />
    </div>
  );
};

export default PostCard;
