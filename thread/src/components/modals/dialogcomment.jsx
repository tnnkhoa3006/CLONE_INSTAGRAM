import { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ModeCommentOutlinedIcon from "@mui/icons-material/ModeCommentOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import TurnedInNotIcon from "@mui/icons-material/TurnedInNot";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Dialogmore_option from "../modals/dialogmore_option";
import CommentBox from "../post.component/commentBox";
import { useDispatch, useSelector } from "react-redux";
import api from "../../services/axios";
import { toast } from "react-hot-toast";
import { setPosts, setSelectedPost } from "../../redux/postSlice";

const Dialogcomment = ({ isopen, onClose }) => {
    const { selectedPost, posts } = useSelector((store) => store.post);
    const { user } = useSelector((store) => store.auth);
    const [showOptions, setShowOptions] = useState(false);
    const [replyTo, setReplyTo] = useState("");
    const [replyParentId, setReplyParentId] = useState(null);
    const [text, setText] = useState("");
    const inputRef = useRef();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [saved, setSaved] = useState(false);
    const dispatch = useDispatch();
    const [comment, setComment] = useState([]);

    const liked = selectedPost?.likes?.includes(user?._id) || false;
    const postLikes = selectedPost?.likes?.length || 0;
    const post = posts.find((p) => p && p._id === selectedPost?._id);

    useEffect(() => {
        if (selectedPost && user) {
            setComment(selectedPost.comments || []);
            setSaved(!!selectedPost.isBookmarked);
        }
    }, [selectedPost]);

    if (!isopen || !selectedPost) return null;

    const handleEmojiClick = (emojiData) => {
        setText((prev) => prev + emojiData.emoji);
        inputRef.current?.focus();
    };

    const handleReply = (username, parentId) => {
        setReplyTo(username);
        setReplyParentId(parentId);
        setText((prev) => (prev.startsWith(`@${username} `) ? prev : `@${username} `));
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const commentHandler = async () => {
        try {
            const payload = { text };
            if (replyParentId) {
                payload.parentId = replyParentId;
            }
            const res = await api.post(`/post/${selectedPost._id}/comment`, payload, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            if (res.data.success) {
                const updateCommentData = [...comment, res.data.comment];
                setComment(updateCommentData);
                const updatePostData = posts.map((p) =>
                    p._id === selectedPost._id ? { ...p, comments: updateCommentData } : p
                );
                dispatch(setPosts(updatePostData));
                const updatedSelectedPost = {
                    ...selectedPost,
                    comments: updateCommentData,
                };
                dispatch(setSelectedPost(updatedSelectedPost));
                toast.success(res.data.message);
                setText("");
                setReplyTo("");
                setReplyParentId(null);
                setShowEmojiPicker(false);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    };

    const likeOrDislikeHandler = async () => {
        try {
            const action = liked ? "dislike" : "like";
            const res = await api.post(`/post/${selectedPost._id}/${action}`, {}, { withCredentials: true });
            if (res.data.success) {
                const updatedPostData = posts.map((p) =>
                    p._id === selectedPost._id
                        ? {
                            ...p,
                            likes: liked ? p.likes.filter((id) => id !== user._id) : [...p.likes, user._id],
                        }
                        : p
                );
                dispatch(setPosts(updatedPostData));
                const updatedSelectedPost = {
                    ...selectedPost,
                    likes: liked
                        ? selectedPost.likes.filter((id) => id !== user._id)
                        : [...selectedPost.likes, user._id],
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
                const updatedPosts = posts.map((p) =>
                    p._id === post._id ? { ...p, isBookmarked: !saved } : p
                );
                setSaved((prev) => !prev);
                dispatch(setPosts(updatedPosts));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    const renderReplies = (allComments, parentId, level = 1) => {
        const replies = allComments.filter((cmt) => cmt.parentId === parentId);
        if (replies.length === 0) return null;

        const [showReplies, setShowReplies] = useState(false);

        return (
            <div style={{ marginLeft: level * 16 }}>
                {!showReplies ? (
                    <span
                        className="text-blue-400 text-xs cursor-pointer hover:underline"
                        onClick={() => setShowReplies(true)}
                    >
                        View replies ({replies.length})
                    </span>
                ) : (
                    <>
                        <span
                            className="text-blue-400 text-xs cursor-pointer hover:underline"
                            onClick={() => setShowReplies(false)}
                        >
                            Hide replies
                        </span>
                        {replies.map((reply) => (
                            <div key={reply._id}>
                                <CommentBox comment={reply} onReply={handleReply} user={user} />
                                {renderReplies(allComments, reply._id, level + 1)}
                            </div>
                        ))}
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center safe-area-padding">
            <article className="flex flex-col w-full h-full max-w-[500px] md:max-w-4xl bg-zinc-900 rounded-lg md:rounded-2xl overflow-hidden shadow-lg">
                {/* Image/Video Section (Hidden on Mobile, Shown on Desktop) */}
                <div className="hidden md:flex flex-shrink-0 bg-black items-center justify-center w-full md:w-[500px] h-[200px] md:h-full">
                    {selectedPost?.mediaType === "video" ? (
                        <video
                            src={selectedPost?.mediaUrl}
                            controls
                            className="w-full h-full object-cover"
                            style={{ minWidth: 0, minHeight: 0 }}
                        />
                    ) : (
                        <img
                            src={selectedPost?.mediaUrl}
                            alt="imagepost"
                            className="w-full h-full object-cover"
                            style={{ minWidth: 0, minHeight: 0 }}
                        />
                    )}
                </div>
                {/* Content Section */}
                <div className="flex flex-col w-full h-full">
                    {/* Header */}
                    <div className="flex items-center px-3 py-2 border-b border-zinc-700 bg-zinc-900 z-10">
                        <button onClick={onClose} className="md:hidden mr-2 p-1">
                            <ArrowBackIcon style={{ fontSize: 20 }} className="text-white" />
                        </button>
                        <img
                            className="w-8 h-8 object-cover rounded-full border-2 border-r-pink-500 border-b-purple-400 border-l-yellow-400 border-t-orange-400 cursor-pointer"
                            src={selectedPost?.author.ProfilePicture}
                            alt="avatar"
                            onError={(e) => (e.target.src = "/default-avatar.png")}
                        />
                        <span className="ml-2 text-sm font-semibold">{selectedPost?.author.username}</span>
                        <MoreHorizIcon
                            onClick={() => setShowOptions(true)}
                            titleAccess="More options"
                            className="ml-auto cursor-pointer"
                            style={{ fontSize: 18 }}
                        />
                    </div>
                    {/* Body: Caption + Comments */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                        {/* Caption */}
                        <div className="flex items-start gap-2">
                            <img
                                className="w-8 h-8 object-cover rounded-full border-2 border-r-pink-500 border-b-purple-400 border-l-yellow-400 border-t-orange-400 cursor-pointer"
                                src={selectedPost?.author.ProfilePicture}
                                alt="avatar"
                                onError={(e) => (e.target.src = "/default-avatar.png")}
                            />
                            <div className="text-sm">
                                <span className="font-semibold cursor-pointer">{selectedPost?.author.username}</span>{" "}
                                <span className="font-normal">{selectedPost?.caption}</span>
                            </div>
                        </div>
                        {/* Comments */}
                        <div className="space-y-2">
                            {comment
                                .filter((cmt) => !cmt.parentId)
                                .map((cmt) => (
                                    <div key={cmt._id}>
                                        <CommentBox comment={cmt} onReply={handleReply} user={user} />
                                        {renderReplies(comment, cmt._id)}
                                    </div>
                                ))}
                        </div>
                    </div>
                    {/* Footer: Actions + Add Comment */}
                    <div className="sticky bottom-0 px-3 py-2 border-t border-zinc-700 bg-zinc-900 z-10 safe-area-padding">
                        {/* Actions */}
                        <div className="flex items-center space-x-3 mb-2">
                            {liked ? (
                                <FavoriteRoundedIcon
                                    titleAccess="Like"
                                    onClick={likeOrDislikeHandler}
                                    className="cursor-pointer text-red-500"
                                    style={{ fontSize: 20 }}
                                />
                            ) : (
                                <FavoriteBorderRoundedIcon
                                    titleAccess="Like"
                                    onClick={likeOrDislikeHandler}
                                    className="cursor-pointer hover:text-gray-400"
                                    style={{ fontSize: 20 }}
                                />
                            )}
                            <ModeCommentOutlinedIcon
                                titleAccess="Comment"
                                className="cursor-pointer hover:text-gray-400"
                                style={{ fontSize: 20 }}
                            />
                            <ShareOutlinedIcon
                                titleAccess="Share"
                                className="cursor-pointer hover:text-gray-400"
                                style={{ fontSize: 20 }}
                            />
                            {saved ? (
                                <BookmarkIcon
                                    titleAccess="Save"
                                    onClick={bookMarkHandler}
                                    className="cursor-pointer"
                                    style={{ fontSize: 20, marginLeft: "auto" }}
                                />
                            ) : (
                                <TurnedInNotIcon
                                    titleAccess="Save"
                                    onClick={bookMarkHandler}
                                    className="cursor-pointer hover:text-gray-400"
                                    style={{ fontSize: 20, marginLeft: "auto" }}
                                />
                            )}
                        </div>
                        {/* Likes */}
                        <div className="text-sm font-semibold mb-2">{postLikes} likes</div>
                        {/* Add Comment */}
                        <div className="flex items-center gap-2">
                            <textarea
                                ref={inputRef}
                                className="flex-1 bg-zinc-800 text-white outline-none resize-none rounded-md px-2 py-1 text-sm"
                                placeholder="Add a comment..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={1}
                                onFocus={() => setShowEmojiPicker(false)}
                            />
                            {text.trim().length > 0 && (
                                <button onClick={commentHandler} className="text-sm font-semibold text-blue-500">
                                    Post
                                </button>
                            )}
                            <button
                                onClick={() => setShowEmojiPicker((prev) => !prev)}
                                className="p-1"
                            >
                                <EmojiEmotionsIcon
                                    titleAccess="Emoji"
                                    className="cursor-pointer hover:text-gray-400"
                                    style={{ fontSize: 18 }}
                                />
                            </button>
                        </div>
                    </div>
                </div>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-zinc-300 hover:text-white safe-area-padding"
                >
                    <CloseIcon style={{ fontSize: 24 }} />
                </button>
                {showEmojiPicker && (
                    <div className="absolute bottom-20 left-3 right-3 z-50 shadow-lg">
                        <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            theme="dark"
                            height={300}
                            width="100%"
                            previewConfig={{ showPreview: false }}
                        />
                    </div>
                )}
                <Dialogmore_option isOpen={showOptions} onClose={() => setShowOptions(false)} />
            </article>
        </div>
    );
};

export default Dialogcomment;