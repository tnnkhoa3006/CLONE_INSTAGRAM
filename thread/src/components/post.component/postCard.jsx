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
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import Dialogmore_option from "../modals/dialogmore_option";
import Dialogcomment from "../modals/dialogcomment";
import { useDispatch, useSelector } from "react-redux";
import { optimisticLike, setPosts, setSelectedPost } from "../../redux/postSlice.js";
import api from "../../services/axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const PostCard = ({ postId }) => {
  const [text, setText] = useState("");
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [muted, setMuted] = useState(true);
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const dispatch = useDispatch();
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [isLongCaption, setIsLongCaption] = useState(false);
  const captionRef = useRef(null);

  // Lấy post từ Redux store
  const post = posts.find((p) => p._id === postId);

  // Tính toán liked và postLikes từ post hiện tại
  const liked = post?.likes?.includes(user?._id) || false;
  const postLikes = post?.likes?.length || 0;
  const saved = post?.isBookmarked || false;

  useEffect(() => {
    // Kiểm tra caption có dài hơn 2 dòng không
    if (captionRef.current) {
      setIsLongCaption(captionRef.current.scrollHeight > captionRef.current.clientHeight);
    }
  }, [post?.caption]);

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const handleLike = async (post) => {
    // 1. Optimistic update
    dispatch(optimisticLike({ postId: post._id, userId: user._id }));

    try {
      // 2. Gọi API
      const action = post.likes.includes(user._id) ? "dislike" : "like";
      const res = await api.post(`/post/${post._id}/${action}`, {}, { withCredentials: true });
      if (!res.data.success) {
        // Nếu API báo lỗi, rollback lại
        dispatch(optimisticLike({ postId: post._id, userId: user._id }));
        toast.error(res.data.message);
      }
    } catch (error) {
      // Nếu lỗi mạng, rollback lại
      dispatch(optimisticLike({ postId: post._id, userId: user._id }));
      toast.error("Có lỗi xảy ra khi like!");
    }
  };

  const commentHandler = async () => {
    try {
      if (!text.trim()) {
        return toast.error("Bạn chưa nhập nội dung bình luận");
      }
      const res = await api.post(
        `/post/${post._id}/comment`,
        { text },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const currentPost = posts.find((p) => p._id === post._id);
        const updateCommentData = [...(currentPost?.comments || []), res.data.comment];

        const updatePostData = posts.map((p) =>
          p._id === post._id ? { ...p, comments: updateCommentData } : p
        );
        dispatch(setPosts(updatePostData));
        setText("");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const bookMarkHandler = async () => {
    try {
      const res = await api.post(`/post/${postId}/bookmark`, {}, { withCredentials: true });
      if (res.data.success) {
        const updatedPosts = posts.map((p) =>
          p._id === post._id ? { ...p, isBookmarked: !saved } : p
        );
        dispatch(setPosts(updatedPosts));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target.querySelector("video");

          if (!video) return;

          if (entry.isIntersecting) {
            // Pause tất cả video khác
            document.querySelectorAll("video").forEach((v) => {
              if (v !== video) v.pause();
            });

            video.play().catch((e) => console.log("Video play error:", e));
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.7, // 70% xuất hiện mới play
      }
    );

    const current = containerRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);


  // Nếu không có post, return null
  if (!post) return null;

  return (
    <div>
      <div className="w-full max-w-[500px] md:w-[500px] mx-auto bg-black text-white space-y-2">
        {/* Header */}
        <div className="w-full h-[50px] flex items-center pl-4 md:pl-[80px] space-x-2">
          <img
            className="w-[40px] h-[40px] object-cover rounded-full border-4 border-r-pink-500 border-b-purple-400 border-l-yellow-400 border-t-orange-400 cursor-pointer"
            src={post?.author.ProfilePicture || "/default-avatar.png"}
            alt="avatar"
            onError={(e) => (e.target.src = "/default-avatar.png")}
          />
          <Link to={`/profile/${post.author._id}`}>
            <div className="text-[12px] md:text-[14px] h-[20px] items-center font-semibold cursor-pointer">
              {post.author.username}
            </div>
          </Link>
          <div className="flex space-x-1 py-1">
            <div className="text-gray-400 text-[12px] font-extrabold">•</div>
            <div className="text-gray-400 text-[12px] cursor-pointer">
              {dayjs(post.createdAt).fromNow(true)}
            </div>
          </div>
          <MoreHorizIcon
            onClick={() => setShowOptions(true)}
            titleAccess="More options"
            style={{ fontSize: 22, marginLeft: "auto", cursor: "pointer" }}
          />
        </div>

        {/* Image */}
        <div className="w-full pl-4 md:pl-[80px]">
          <div
            ref={containerRef}
            className="relative w-full aspect-square border border-zinc-900 overflow-hidden rounded bg-black"
          >
            {post.mediaType === "video" ? (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  src={post.mediaUrl}
                  controls
                  loop
                />
              </div>
            ) : (
              <img
                className="w-full h-full object-cover"
                src={post.mediaUrl}
                alt="post"
              />
            )}
          </div>
          <div className="flex w-full h-[50px] text-[14px] space-x-4 items-center pl-4 md:pl-0">
            {liked ? (
              <FavoriteRoundedIcon
                titleAccess="Like"
                onClick={() => handleLike(post)}
                style={{ fontSize: 27, cursor: "pointer", color: "red" }}
              />
            ) : (
              <FavoriteBorderRoundedIcon
                titleAccess="Like"
                onClick={() => handleLike(post)}
                style={{ fontSize: 27, cursor: "pointer" }}
              />
            )}
            <ModeCommentOutlinedIcon
              onClick={() => {
                dispatch(setSelectedPost(post));
                setShowComment(true);
              }}
              titleAccess="Comment"
              style={{ fontSize: 27, cursor: "pointer" }}
            />
            <ShareOutlinedIcon
              titleAccess="Share"
              style={{ fontSize: 27, cursor: "pointer" }}
            />
            {saved ? (
              <BookmarkIcon
                titleAccess="Save"
                onClick={bookMarkHandler}
                style={{ fontSize: 27, cursor: "pointer", color: "white", marginLeft: "auto" }}
              />
            ) : (
              <TurnedInNotIcon
                titleAccess="Save"
                onClick={bookMarkHandler}
                style={{ fontSize: 27, cursor: "pointer", marginLeft: "auto" }}
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="w-full pl-4 md:pl-[80px] space-y-2">
          <div className="flex h-[35px]">
            <div className="text-[14px] items-center font-semibold">{postLikes} likes</div>
          </div>

          <div className="text-sm font-normal leading-relaxed relative">
            <span className="font-semibold text-sm cursor-pointer">{post.author.username}</span>{" "}
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
              {post.caption}
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
          {post.comments && post.comments.length > 0 && (
            <div
              onClick={() => {
                dispatch(setSelectedPost(post));
                setShowComment(true);
              }}
              className="text-[15px] text-gray-400 cursor-pointer"
            >
              View all {post.comments.length} comments
            </div>
          )}

          {/* Comment box */}
          <div className="flex w-full items-center">
            <textarea
              className="w-full max-w-[calc(100%-50px)] bg-black text-white outline-none resize-none"
              placeholder="Add a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            {text.trim().length > 0 && (
              <button
                onClick={commentHandler}
                className="text-sm font-semibold text-blue-500 ml-2"
              >
                Post
              </button>
            )}
            <div className="relative ml-2">
              <button
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="text-sm font-semibold"
              >
                <EmojiEmotionsIcon
                  titleAccess="Emoji"
                  style={{ fontSize: 20, cursor: "pointer" }}
                />
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
          <div className="w-full max-w-[calc(100%-80px)] md:max-w-[480px] border-b border-gray-700 mx-auto" />
        </div>
      </div>
      <Dialogmore_option isOpen={showOptions} onClose={() => setShowOptions(false)} post={post} />
      <Dialogcomment isopen={showComment} onClose={() => setShowComment(false)} post={post} />
    </div>
  );
};

export default PostCard;