import React, { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ModeCommentOutlinedIcon from "@mui/icons-material/ModeCommentOutlined";
import TurnedInNotIcon from "@mui/icons-material/TurnedInNot";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import Dialogmore_option from "../components/modals/dialogmore_option";
import DialogReelComment from "../components/modals/DialogReelComment";
import { setPosts, setSelectedPost } from "../redux/postSlice";
import api from "../services/axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

const ReelsPage = () => {
  const dispatch = useDispatch();
  const { posts } = useSelector((store) => store.post);
  const { user } = useSelector((store) => store.auth);

  const videoPosts = posts.filter((p) => p.mediaType === "video");

  const [showOptions, setShowOptions] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [selectedPost, setSelectedPostLocal] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [mutedStates, setMutedStates] = useState([]);
  const [showFullCaption, setShowFullCaption] = useState({});
  const [isLongCaption, setIsLongCaption] = useState({});
  const captionRefs = useRef({});

  const videoRefs = useRef([]);
  const containerRef = useRef(null);
  const observer = useRef(null);

  useEffect(() => {
    setMutedStates(videoPosts.map(() => true)); // reset muted states
    videoRefs.current = videoRefs.current.slice(0, videoPosts.length);
  }, [videoPosts.length]);

  useEffect(() => {
    const options = {
      root: containerRef.current,
      threshold: 0.7,
    };

    observer.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        const index = parseInt(video.dataset.index);
        if (entry.isIntersecting) {
          video.muted = mutedStates[index];
          video.play().catch(() => { });
        } else {
          video.pause();
        }
      });
    }, options);

    const videos = videoRefs.current;
    videos.forEach((video) => {
      if (video) observer.current.observe(video);
    });

    return () => {
      if (observer.current) {
        videos.forEach((video) => {
          if (video) observer.current.unobserve(video);
        });
      }
    };
  }, [mutedStates]);

  useEffect(() => {
    const newIsLongCaption = {};
    videoPosts.forEach((post) => {
      const el = captionRefs.current[post._id];
      if (el) {
        newIsLongCaption[post._id] = el.scrollHeight > el.clientHeight + 1;
      }
    });
    setIsLongCaption(newIsLongCaption);
  }, [videoPosts.map(p => p.caption).join('|'), videoPosts.length]);

  const toggleMute = (index) => {
    const updated = [...mutedStates];
    updated[index] = !updated[index];
    setMutedStates(updated);
    const video = videoRefs.current[index];
    if (video) video.muted = updated[index];
  };

  const likeOrDislikeHandler = async (post) => {
    // Optimistic update
    const liked = post.likes.includes(user._id);
    const updatedLikes = liked
        ? post.likes.filter((id) => id !== user._id)
        : [...post.likes, user._id];

    // Cập nhật UI ngay
    const updatedPostData = posts.map((p) =>
        p._id === post._id ? { ...p, likes: updatedLikes } : p
    );
    dispatch(setPosts(updatedPostData));

    try {
        const action = liked ? "dislike" : "like";
        const res = await api.post(`/post/${post._id}/${action}`, {}, { withCredentials: true });
        if (!res.data.success) {
            toast.error(res.data.message);
            // Rollback
            const rollbackLikes = liked
                ? [...post.likes, user._id]
                : post.likes.filter((id) => id !== user._id);
            const rollbackPostData = posts.map((p) =>
                p._id === post._id ? { ...p, likes: rollbackLikes } : p
            );
            dispatch(setPosts(rollbackPostData));
        }
    } catch (error) {
        toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi like!");
        // Rollback
        const rollbackLikes = liked
            ? [...post.likes, user._id]
            : post.likes.filter((id) => id !== user._id);
        const rollbackPostData = posts.map((p) =>
            p._id === post._id ? { ...p, likes: rollbackLikes } : p
        );
        dispatch(setPosts(rollbackPostData));
    }
};

  const bookMarkHandler = async (post) => {
    try {
      const res = await api.post(`/post/${post._id}/bookmark`, {}, { withCredentials: true });
      if (res.data.success) {
        const updatedPosts = posts.map((p) =>
          p._id === post._id ? { ...p, isBookmarked: !p.isBookmarked } : p
        );
        dispatch(setPosts(updatedPosts));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const commentHandler = async (post) => {
    if (!commentText.trim()) return toast.error("Bạn chưa nhập nội dung bình luận");
    try {
      const res = await api.post(
        `/post/${post._id}/comment`,
        { text: commentText },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );
      if (res.data.success) {
        const currentPost = posts.find((p) => p._id === post._id);
        const updateCommentData = [...(currentPost?.comments || []), res.data.comment];
        const updatePostData = posts.map((p) =>
          p._id === post._id ? { ...p, comments: updateCommentData } : p
        );
        dispatch(setPosts(updatePostData));
        toast.success(res.data.message);
        setCommentText("");
        setShowComment(false);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleShowOptions = (post) => {
    setSelectedPostLocal(post);
    setShowOptions(true);
  };

  const handleShowComment = (post) => {
    setSelectedPostLocal(post);
    setShowComment(true);
    dispatch(setSelectedPost(post));
  };

  const handleCaptionRef = (postId) => (el) => {
    if (el) {
      captionRefs.current[postId] = el;
    }
  };

  return (
    <div
      className="h-screen overflow-y-scroll md:w-[450px] md:mx-auto md:flex md:flex-col md:items-center snap-y snap-mandatory bg-black no-scrollbar"
      ref={containerRef}
    >
      {videoPosts.length === 0 ? (
        <div className="text-white text-xl text-center mt-10">Không có video nào!</div>
      ) : (
        videoPosts.map((post, idx) => {
          const liked = post.likes.includes(user._id);
          const saved = post.isBookmarked;
          return (
            <div
              key={post._id}
              className="relative w-full h-screen md:h-[700px] snap-start flex-shrink-0 md:pt-2 md:mt-4"
            >
              {/* 🎥 VIDEO */}
              <div className="relative w-full h-full border border-gray-700">
                <video
                  data-index={idx}
                  ref={(el) => (videoRefs.current[idx] = el)}
                  src={post.mediaUrl}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  loop
                  playsInline
                  muted={mutedStates[idx]}
                />

                {/* 🔇 MUTE/UNMUTE */}
                <div className="absolute top-20 right-4 md:top-0 md:right-0 z-60 bg-black/50 rounded-full p-1">
                  <button onClick={() => toggleMute(idx)}>
                    {mutedStates[idx] ? (
                      <VolumeOffIcon className="text-white" />
                    ) : (
                      <VolumeUpIcon className="text-white" />
                    )}
                  </button>
                </div>

                {/* 📄 INFO & CAPTION */}
                <div className="absolute bottom-16 md:bottom-0 w-full text-white px-4 pb-6 pt-16 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <Link to={`/profile/${post.author._id}`}>
                      <img
                        src={post.author.ProfilePicture || "/default-avatar.png"}
                        alt="avatar"
                        className="w-9 h-9 rounded-full object-cover border border-white"
                        onError={(e) => (e.target.src = "/default-avatar.png")}
                      />
                    </Link>
                    <Link to={`/profile/${post.author._id}`}>
                      <span className="font-medium text-[16px] truncate">@{post.author.username}</span>
                    </Link>
                    <button className="ml-auto" onClick={() => handleShowOptions(post)}>
                      <MoreHorizIcon className="text-white" />
                    </button>
                  </div>
                  <div className="flex items-center pt-4 text-[14px] leading-snug break-words flex-wrap">
                    <span
                      ref={handleCaptionRef(post._id)}
                      className={
                        showFullCaption[post._id]
                          ? "font-light max-h-24 overflow-y-auto"
                          : "font-light line-clamp-1"
                      }
                      style={
                        showFullCaption[post._id]
                          ? {
                            maxHeight: "96px",
                            overflowY: "auto",
                            display: "block",
                          }
                          : {
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            maxWidth: "100%",
                          }
                      }
                    >
                      {post.caption}
                    </span>
                    {(isLongCaption[post._id] || showFullCaption[post._id]) && (
                      <button
                        className="text-gray-400 ml-2 text-xs font-semibold md:hover:underline flex-shrink-0"
                        onClick={() =>
                          setShowFullCaption((prev) => ({
                            ...prev,
                            [post._id]: !prev[post._id],
                          }))
                        }
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {showFullCaption[post._id] ? "Ẩn bớt" : "Xem thêm"}
                      </button>
                    )}
                  </div>
                </div>

                {/* ❤️ ACTION ICONS */}
                <div className="absolute right-3 top-1/2 sm:bottom-28 flex flex-col items-center space-y-5">
                  <div className="flex flex-col items-center">
                    {liked ? (
                      <FavoriteRoundedIcon
                        fontSize="large"
                        className="text-red-500 cursor-pointer"
                        onClick={() => likeOrDislikeHandler(post)}
                      />
                    ) : (
                      <FavoriteBorderRoundedIcon
                        fontSize="large"
                        className="text-white cursor-pointer"
                        onClick={() => likeOrDislikeHandler(post)}
                      />
                    )}
                    <div className="text-xs text-white">{post.likes.length}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <ModeCommentOutlinedIcon
                      fontSize="large"
                      className="text-white cursor-pointer"
                      onClick={() => handleShowComment(post)}
                    />
                    <div className="text-xs text-white">{post.comments.length}</div>
                  </div>
                  <div>
                    {saved ? (
                      <BookmarkIcon
                        fontSize="large"
                        className="text-white cursor-pointer"
                        onClick={() => bookMarkHandler(post)}
                      />
                    ) : (
                      <TurnedInNotIcon
                        fontSize="large"
                        className="text-white cursor-pointer"
                        onClick={() => bookMarkHandler(post)}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* MODALS */}
      {selectedPost && (
        <>
          <Dialogmore_option
            isOpen={showOptions}
            onClose={() => setShowOptions(false)}
            post={selectedPost}
          />
          <DialogReelComment
            isOpen={showComment}
            onClose={() => setShowComment(false)}
            post={selectedPost}
          />
        </>
      )}
    </div>
  );
};

export default ReelsPage;
