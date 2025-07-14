import { useState, useEffect } from 'react';
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
import CloseIcon from '@mui/icons-material/Close';
import CommentBox from '../post.component/commentBox';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../services/axios';
import { toast } from 'react-hot-toast';
import { setPosts, setSelectedPost } from '../../redux/postSlice';

const Dialogcomment = ({ isopen, onClose }) => {
    const { selectedPost, posts } = useSelector(store => store.post);
    const [showOptions, setShowOptions] = useState(false)
    const { user } = useSelector(store => store.auth)
    const [text, setText] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [saved, setSaved] = useState(false);
    const dispatch = useDispatch()
    const [comment, setComment] = useState([]);

    // Tính toán liked và postLikes từ post hiện tại
    const liked = selectedPost?.likes?.includes(user?._id) || false;
    const postLikes = selectedPost?.likes?.length || 0;

    // Lấy post từ Redux store thay vì từ prop
    const post = posts.find(p => p._id === selectedPost._id);

    useEffect(() => {
        if (selectedPost && user) {
            setComment(selectedPost.comments || [])
            setSaved(!!selectedPost.isBookmarked);
        }
    }, [selectedPost]);

    if (!isopen || !selectedPost) return null;

    const handleEmojiClick = (emojiData) => {
        setText((prev) => prev + emojiData.emoji);
    };

    const commentHandler = async () => {
        try {
            const res = await api.post(`/post/${selectedPost._id}/comment`, { text },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }, withCredentials: true
                }
            );
            if (res.data.success) {
                const updateCommentData = [...comment, res.data.comment];
                setComment(updateCommentData);
                const updatePostData = posts.map(p =>
                    p._id === selectedPost._id ? {
                        ...p,
                        comments: updateCommentData
                    } : p
                );
                dispatch(setPosts(updatePostData));
                // Cập nhật selectedPost với dữ liệu mới
                const updatedSelectedPost = {
                    ...selectedPost,
                    comments: updateCommentData
                };
                dispatch(setSelectedPost(updatedSelectedPost));
                toast.success(res.data.message);
                setText('');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    };

    const likeOrDislikeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await api.post(`/post/${selectedPost._id}/${action}`, {}, { withCredentials: true });
            if (res.data.success) {
                const updatedPostData = posts.map(p =>
                    p._id === selectedPost._id ? {
                        ...p,
                        likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    } : p
                );
                dispatch(setPosts(updatedPostData));
                // Cập nhật selectedPost với dữ liệu mới
                const updatedSelectedPost = {
                    ...selectedPost,
                    likes: liked ? selectedPost.likes.filter(id => id !== user._id) : [...selectedPost.likes, user._id]
                };
                dispatch(setSelectedPost(updatedSelectedPost));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    };

    const bookMarkHandler = async () => {
        try {
            const res = await api.post(`/post/${selectedPost._id}/bookmark`, {}, { withCredentials: true });
            if (res.data.success) {
                const updatedPosts = posts.map(p =>
                    p._id === post._id
                        ? { ...p, isBookmarked: !saved }
                        : p
                );
                setSaved(prev => !prev);
                dispatch(setPosts(updatedPosts));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center">
            <article className="flex text-white bg-zinc-900 rounded-lg overflow-hidden shadow-lg">
                {/* Image section */}
                <div
                    className="flex-shrink-0 bg-black flex items-center justify-center"
                    style={{ width: 500, height: 600 }}
                >
                    <img
                        src={selectedPost?.image}
                        alt="imagepost"
                        className="w-full h-full object-cover"
                        style={{ minWidth: 0, minHeight: 0 }}
                    />
                </div>
                {/* Content section */}
                <div className="flex flex-col bg-zinc-800" style={{ width: 500, height: 600 }}>
                    {/* Header */}
                    <div className="flex items-center px-4 py-3 border-b border-zinc-700">
                        <img
                            className="w-10 h-10 object-cover rounded-full border-2 border-r-pink-500 border-b-purple-400 border-l-yellow-400 border-t-orange-400 cursor-pointer"
                            src={selectedPost?.author.ProfilePicture}
                            alt="avatar"
                        />
                        <span className="ml-3 text-sm font-semibold">{selectedPost?.author.username}</span>
                        <MoreHorizIcon
                            onClick={() => setShowOptions(true)}
                            titleAccess="More options"
                            className="ml-auto cursor-pointer"
                            style={{ fontSize: 22 }}
                        />
                    </div>
                    {/* Body: Caption + Comments */}
                    <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-3 space-y-4">
                        {/* Caption */}
                        <div className="flex items-start gap-3">
                            <img
                                className="w-10 h-10 object-cover rounded-full border-2 border-r-pink-500 border-b-purple-400 border-l-yellow-400 border-t-orange-400 cursor-pointer"
                                src={selectedPost?.author.ProfilePicture}
                                alt="avatar"
                            />
                            <div className="text-sm">
                                <span className="font-semibold cursor-pointer">{selectedPost?.author.username}</span>{' '}
                                <span className="font-normal">{selectedPost?.caption}</span>
                            </div>
                        </div>
                        {/* Comments */}
                        <div className="space-y-2">
                            {comment.map((comment) =>
                                <CommentBox key={comment._id} comment={comment} />
                            )}
                        </div>
                    </div>
                    {/* Footer: Actions + Add comment */}
                    <div className="px-4 py-3 border-t border-zinc-700">
                        {/* Actions */}
                        <div className="flex items-center space-x-4 mb-2">
                            {liked ? (
                                <FavoriteRoundedIcon titleAccess="Like" onClick={likeOrDislikeHandler} style={{ fontSize: 27, cursor: 'pointer', color: 'red' }} />
                            ) : (
                                <FavoriteBorderRoundedIcon titleAccess="Like" onClick={likeOrDislikeHandler} className="hover:text-gray-400" style={{ fontSize: 27, cursor: 'pointer' }} />
                            )}
                            <ModeCommentOutlinedIcon
                                titleAccess="Comment"
                                className="hover:text-gray-400"
                                style={{ fontSize: 27, cursor: 'pointer' }}
                            />
                            <ShareOutlinedIcon titleAccess="Share" className="hover:text-gray-400" style={{ fontSize: 27, cursor: 'pointer' }} />
                            {saved ? (
                                <BookmarkIcon titleAccess="Save" onClick={bookMarkHandler} style={{ fontSize: 27, cursor: 'pointer', color: 'white', marginLeft: 'auto' }} />
                            ) : (
                                <TurnedInNotIcon titleAccess="Save" onClick={bookMarkHandler} className="hover:text-gray-400" style={{ fontSize: 27, cursor: 'pointer', marginLeft: 'auto' }} />
                            )}
                        </div>
                        {/* Likes */}
                        <div className="text-sm font-semibold mb-1">{postLikes} likes</div>
                        {/* Add comment */}
                        <div className="flex items-center gap-2">
                            <textarea
                                className="flex-1 bg-zinc-800 text-white outline-none resize-none hide-scrollbar rounded-md px-2 py-1"
                                placeholder="Add a comment..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={1}
                            />
                            {text.trim().length > 0 && (
                                <button onClick={commentHandler} className="text-sm font-semibold text-blue-500">Post</button>
                            )}
                            <div className="relative">
                                <button
                                    onClick={() => setShowEmojiPicker(prev => !prev)}
                                    className="text-sm font-semibold"
                                >
                                    <EmojiEmotionsIcon titleAccess="Emoji" className="hover:text-gray-400" style={{ fontSize: 20, cursor: 'pointer' }} />
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute bottom-10 right-0 z-50 shadow-lg">
                                        <EmojiPicker
                                            onEmojiClick={handleEmojiClick}
                                            theme="dark"
                                            height={350}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </article>
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-8 text-zinc-300 hover:text-white"
            >
                <CloseIcon style={{ fontSize: 32 }} />
            </button>
            <Dialogmore_option isOpen={showOptions} onClose={() => setShowOptions(false)} />
        </div>
    )
}

export default Dialogcomment
