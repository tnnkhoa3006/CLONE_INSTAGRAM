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
import Dialogmore_option from "./dialogmore_option";
import CommentBox from "../post.component/commentBox";
import { useDispatch, useSelector } from "react-redux";
import api from "../../services/axios";
import { toast } from "react-hot-toast";
import { setPosts, setSelectedPost } from "../../redux/postSlice";
import { Link } from "react-router-dom";

function RepliesThread({ allComments, parentId, level, onReply, user, openReplies, setOpenReplies }) {
    const replies = allComments.filter((cmt) => cmt.parentId === parentId);
    if (replies.length === 0) return null;

    const isVisible = openReplies[parentId] || false;

    return (
        <div style={{ marginLeft: level * 16 }}>
            {!isVisible ? (
                <span
                    className="text-gray-400 text-xs cursor-pointer hover:underline"
                    onClick={() => setOpenReplies((prev) => ({ ...prev, [parentId]: true }))}
                >
                    View replies ({replies.length})
                </span>
            ) : (
                <>
                    <span
                        className="text-gray-400 text-xs cursor-pointer hover:underline"
                        onClick={() => setOpenReplies((prev) => ({ ...prev, [parentId]: false }))}
                    >
                        Hide replies
                    </span>
                    {replies.map((reply) => (
                        <div key={reply._id}>
                            <CommentBox comment={reply} onReply={onReply} user={user} />
                            <RepliesThread
                                allComments={allComments}
                                parentId={reply._id}
                                level={level + 1}
                                onReply={onReply}
                                user={user}
                                openReplies={openReplies}
                                setOpenReplies={setOpenReplies}
                            />
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}

const DialogReelComment = ({ isOpen, onClose, post }) => {
    const { posts } = useSelector((store) => store.post);
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
    const [openReplies, setOpenReplies] = useState({});
    const [showFullCaption, setShowFullCaption] = useState(false);
    const [isLongCaption, setIsLongCaption] = useState(false);
    const captionRef = useRef(null);

    useEffect(() => {
        // Kiểm tra caption có dài hơn 2 dòng không
        if (captionRef.current) {
            setIsLongCaption(captionRef.current.scrollHeight > captionRef.current.clientHeight);
        }
    }, [post?.caption]);

    const currentPost = posts.find((p) => p._id === post._id) || post;

    const liked = currentPost.likes.includes(user._id);
    const postLikes = currentPost.likes.length;

    useEffect(() => {
        if (post && user) {
            setComment(post.comments || []);
            setSaved(!!post.isBookmarked);
        }
    }, [post, user]);

    if (!isOpen || !post) return null;

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
            const res = await api.post(`/post/${post._id}/comment`, payload, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            if (res.data.success) {
                const updateCommentData = [...comment, res.data.comment];
                setComment(updateCommentData);
                const updatePostData = posts.map((p) =>
                    p._id === post._id ? { ...p, comments: updateCommentData } : p
                );
                dispatch(setPosts(updatePostData));
                const updatedSelectedPost = { ...post, comments: updateCommentData };
                dispatch(setSelectedPost(updatedSelectedPost));
                setText("");
                setReplyTo("");
                setReplyParentId(null);
                setShowEmojiPicker(false);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    const likeOrDislikeHandler = async () => {
        // Lấy lại post mới nhất từ Redux (tránh dùng biến cũ)
        const currentPost = posts.find((p) => p._id === post._id) || post;
        const currentlyLiked = currentPost.likes.includes(user._id);

        // Optimistic update
        const updatedLikes = currentlyLiked
            ? currentPost.likes.filter((id) => id !== user._id)
            : [...currentPost.likes, user._id];

        // Cập nhật UI ngay
        const updatedSelectedPost = { ...currentPost, likes: updatedLikes };
        dispatch(setSelectedPost(updatedSelectedPost));
        const updatedPostData = posts.map((p) =>
            p._id === post._id ? { ...p, likes: updatedLikes } : p
        );
        dispatch(setPosts(updatedPostData));

        try {
            const action = currentlyLiked ? "dislike" : "like";
            const res = await api.post(`/post/${post._id}/${action}`, {}, { withCredentials: true });
            if (!res.data.success) {
                toast.error(res.data.message);
                // Rollback nếu API báo lỗi
                const rollbackLikes = currentlyLiked
                    ? [...currentPost.likes, user._id]
                    : currentPost.likes.filter((id) => id !== user._id);
                const rollbackSelectedPost = { ...currentPost, likes: rollbackLikes };
                dispatch(setSelectedPost(rollbackSelectedPost));
                const rollbackPostData = posts.map((p) =>
                    p._id === post._id ? { ...p, likes: rollbackLikes } : p
                );
                dispatch(setPosts(rollbackPostData));
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi like!");
            // Rollback nếu lỗi mạng
            const rollbackLikes = currentlyLiked
                ? [...currentPost.likes, user._id]
                : currentPost.likes.filter((id) => id !== user._id);
            const rollbackSelectedPost = { ...currentPost, likes: rollbackLikes };
            dispatch(setSelectedPost(rollbackSelectedPost));
            const rollbackPostData = posts.map((p) =>
                p._id === post._id ? { ...p, likes: rollbackLikes } : p
            );
            dispatch(setPosts(rollbackPostData));
        }
    };

    const bookMarkHandler = async () => {
        try {
            const res = await api.post(`/post/${post._id}/bookmark`, {}, { withCredentials: true });
            if (res.data.success) {
                const updatedPosts = posts.map((p) =>
                    p._id === post._id ? { ...p, isBookmarked: !saved } : p
                );
                setSaved((prev) => !prev);
                dispatch(setPosts(updatedPosts));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    return (
        <div className="fixed inset-0 z-50 md:py-12 bg-black bg-opacity-80 flex items-center justify-center safe-area-padding">
            <article className="flex flex-col w-full h-full max-w-[500px] md:max-w-xl bg-zinc-900 rounded-lg md:rounded-2xl overflow-hidden shadow-lg">
                <div className="flex flex-col w-full h-full">
                    {/* Header */}
                    <div className="flex items-center px-3 py-2 border-b border-zinc-700 bg-zinc-900 z-10">
                        <button onClick={onClose} className="md:hidden mr-2 p-1">
                            <ArrowBackIcon style={{ fontSize: 28 }} className="text-white" />
                        </button>
                        <img
                            className="w-10 h-10 object-cover rounded-full border-2 border-r-pink-500 border-b-purple-400 border-l-yellow-400 border-t-orange-400 cursor-pointer"
                            src={currentPost.author.ProfilePicture}
                            alt="avatar"
                            onError={(e) => (e.target.src = "/default-avatar.png")}
                        />
                        <span className="ml-2 text-sm font-semibold">{currentPost.author.username}</span>
                        <MoreHorizIcon
                            onClick={() => setShowOptions(true)}
                            titleAccess="More options"
                            className="ml-auto cursor-pointer"
                            style={{ fontSize: 28 }}
                        />
                    </div>
                    {/* Body: Caption + Comments */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                        <div className="flex items-start gap-2">
                            <img
                                className="w-10 h-10 object-cover rounded-full border-2 border-r-pink-500 border-b-purple-400 border-l-yellow-400 border-t-orange-400 cursor-pointer"
                                src={currentPost.author.ProfilePicture}
                                alt="avatar"
                                onError={(e) => (e.target.src = "/default-avatar.png")}
                            />
                            <div className="text-sm">
                                <Link to={`/profile/${currentPost.author._id}`}>
                                    <span className="font-semibold cursor-pointer">{currentPost.author.username}</span>{" "}
                                </Link>
                                <span
                                    ref={captionRef}
                                    className="font-light"
                                    style={
                                        showFullCaption
                                            ? {}
                                            : {
                                                display: "-webkit-box",
                                                WebkitLineClamp: 1,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                            }
                                    }
                                >
                                    {currentPost.caption}
                                </span>
                                {isLongCaption && (
                                    <button
                                        className="text-gray-400 ml-2 text-xs font-semibold md:hover:underline"
                                        onClick={() => setShowFullCaption((prev) => !prev)}
                                    >
                                        {showFullCaption ? "Ẩn bớt" : "Xem thêm"}
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            {comment
                                .filter((cmt) => !cmt.parentId)
                                .map((cmt) => (
                                    <div key={cmt._id}>
                                        <CommentBox comment={cmt} onReply={handleReply} user={user} />
                                        <RepliesThread
                                            allComments={comment}
                                            parentId={cmt._id}
                                            level={1}
                                            onReply={handleReply}
                                            user={user}
                                            openReplies={openReplies}
                                            setOpenReplies={setOpenReplies}
                                        />
                                    </div>
                                ))}
                        </div>
                    </div>
                    {/* Footer: Actions + Add Comment */}
                    <div className="sticky bottom-0 px-3 py-8 border-t border-zinc-700 bg-zinc-900 z-10 safe-area-padding md:safe-area-padding-bottom">
                        <div className="flex items-center space-x-3 mb-2">
                            {liked ? (
                                <FavoriteRoundedIcon
                                    titleAccess="Like"
                                    onClick={likeOrDislikeHandler}
                                    className="cursor-pointer text-red-500"
                                    style={{ fontSize: 28 }}
                                />
                            ) : (
                                <FavoriteBorderRoundedIcon
                                    titleAccess="Like"
                                    onClick={likeOrDislikeHandler}
                                    className="cursor-pointer hover:text-gray-400"
                                    style={{ fontSize: 28 }}
                                />
                            )}
                            <ModeCommentOutlinedIcon
                                titleAccess="Comment"
                                className="cursor-pointer hover:text-gray-400"
                                style={{ fontSize: 28 }}
                            />
                            <ShareOutlinedIcon
                                titleAccess="Share"
                                className="cursor-pointer hover:text-gray-400"
                                style={{ fontSize: 28 }}
                            />
                            {saved ? (
                                <BookmarkIcon
                                    titleAccess="Save"
                                    onClick={bookMarkHandler}
                                    className="cursor-pointer"
                                    style={{ fontSize: 28, marginLeft: "auto" }}
                                />
                            ) : (
                                <TurnedInNotIcon
                                    titleAccess="Save"
                                    onClick={bookMarkHandler}
                                    className="cursor-pointer hover:text-gray-400"
                                    style={{ fontSize: 28, marginLeft: "auto" }}
                                />
                            )}
                        </div>
                        <div className="text-sm font-semibold mb-2">{postLikes} likes</div>
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
                            <button onClick={() => setShowEmojiPicker((prev) => !prev)} className="p-1">
                                <EmojiEmotionsIcon
                                    titleAccess="Emoji"
                                    className="cursor-pointer hover:text-gray-400"
                                    style={{ fontSize: 18 }}
                                />
                            </button>
                        </div>
                    </div>
                </div>
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
                <Dialogmore_option isOpen={showOptions} onClose={() => setShowOptions(false)} post={post} />
            </article>
        </div>
    );
};

export default DialogReelComment;