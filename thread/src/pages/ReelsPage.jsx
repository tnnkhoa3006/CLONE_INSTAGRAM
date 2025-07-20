import React, { useRef, useEffect, useState, useMemo } from "react";
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
  const [showOptions, setShowOptions] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [selectedPost, setSelectedPostLocal] = useState(null);
  const [mutedStates, setMutedStates] = useState([]);
  const [showFullCaption, setShowFullCaption] = useState({});
  const [isLongCaption, setIsLongCaption] = useState({});
  const captionRefs = useRef({});
  const shuffleArray = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };
  const videoPosts = useMemo(() => {
    const videos = posts.filter((p) => p.mediaType === "video");
    return shuffleArray(videos);
  }, [posts]);

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

  // Show options dialog
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
      className="h-screen overflow-y-scroll w-full md:w-[450px] md:mx-auto md:flex md:flex-col md:items-center snap-y snap-mandatory bg-black no-scrollbar md:ml-[245px] pt-14 md:pt-0"
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
              <div className="relative w-full h-full md:border md:border-gray-700">
                <video
                  data-index={idx}
                  ref={(el) => (videoRefs.current[idx] = el)}
                  src={post.mediaUrl}
                  className="absolute top-0 left-0 w-full h-full"
                  loop
                  playsInline
                  muted={mutedStates[idx]}
                />

                {/* 🔇 MUTE/UNMUTE - Mobile optimized */}
                <div className="absolute top-16 right-3 sm:top-16 sm:right-4 md:top-4 md:right-4 z-60 bg-black/60 rounded-full p-2 sm:p-3 backdrop-blur-sm">
                  <button
                    onClick={() => toggleMute(idx)}
                    className="flex items-center justify-center touch-manipulation"
                  >
                    {mutedStates[idx] ? (
                      <VolumeOffIcon className="text-white text-base sm:text-lg" />
                    ) : (
                      <VolumeUpIcon className="text-white text-base sm:text-lg" />
                    )}
                  </button>
                </div>

                {/* 📄 INFO & CAPTION - Mobile optimized */}
                <div className="absolute bottom-20 sm:bottom-24 md:bottom-0 left-0 right-0 text-white px-3 sm:px-4 pb-4 sm:pb-6 pt-8 sm:pt-12 md:pt-16 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                  <div className="flex items-center gap-2 sm:gap-3 text-sm mb-2 sm:mb-3">
                    <Link to={`/profile/${post.author._id}`} className="flex-shrink-0">
                      <img
                        src={post.author.ProfilePicture || "/default-avatar.png"}
                        alt="avatar"
                        className="w-8 h-8 sm:w-10 sm:h-10 md:w-9 md:h-9 rounded-full object-cover border border-white"
                        onError={(e) => (e.target.src = "/default-avatar.png")}
                      />
                    </Link>
                    <Link
                      to={`/profile/${post.author._id}`}
                      className="flex-shrink-0 min-w-0"
                    >
                      <span className="font-medium text-sm sm:text-base md:text-[16px] truncate block max-w-[150px] sm:max-w-[200px]">
                        @{post.author.username}
                      </span>
                    </Link>
                    <button
                      className="ml-auto flex-shrink-0 p-1 touch-manipulation z-50 relative"
                      onClick={() => handleShowOptions(post)}
                    >
                      <MoreHorizIcon className="text-white text-lg sm:text-xl" />
                    </button>
                  </div>

                  {/* Caption - Mobile optimized */}
                  <div className="flex items-start text-xs sm:text-sm md:text-[14px] leading-relaxed break-words">
                    <span
                      ref={handleCaptionRef(post._id)}
                      className={
                        showFullCaption[post._id]
                          ? "font-light max-h-16 sm:max-h-20 md:max-h-24 overflow-y-auto pr-2"
                          : "font-light line-clamp-2 sm:line-clamp-1 pr-2"
                      }
                      style={
                        showFullCaption[post._id]
                          ? {
                            maxHeight: "64px",
                            overflowY: "auto",
                            display: "block",
                          }
                          : {
                            display: "-webkit-box",
                            WebkitLineClamp: window.innerWidth < 640 ? 2 : 1,
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
                        className="text-gray-300 text-xs font-semibold hover:underline flex-shrink-0 ml-1 touch-manipulation z-50 relative"
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

                {/* ❤️ ACTION ICONS - Mobile optimized */}
                <div className="absolute right-2 top-[40%] sm:right-3 md:right-3 bottom-32 sm:bottom-36 md:bottom-28 md:top-[40%] flex flex-col items-center space-y-4 sm:space-y-5">
                  {/* Like */}
                  <div className="flex flex-col items-center">
                    <button
                      className="bg-black/30 rounded-full p-2 sm:p-3 backdrop-blur-sm touch-manipulation active:scale-95 transition-transform"
                      onClick={() => likeOrDislikeHandler(post)}
                    >
                      {liked ? (
                        <FavoriteRoundedIcon
                          className="text-red-500 text-xl sm:text-2xl md:text-3xl"
                        />
                      ) : (
                        <FavoriteBorderRoundedIcon
                          className="text-white text-xl sm:text-2xl md:text-3xl"
                        />
                      )}
                    </button>
                    <div className="text-xs sm:text-sm text-white mt-1 font-medium">
                      {post.likes.length}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="flex flex-col items-center">
                    <button
                      className="bg-black/30 rounded-full p-2 sm:p-3 backdrop-blur-sm touch-manipulation active:scale-95 transition-transform"
                      onClick={() => handleShowComment(post)}
                    >
                      <ModeCommentOutlinedIcon
                        className="text-white text-xl sm:text-2xl md:text-3xl"
                      />
                    </button>
                    <div className="text-xs sm:text-sm text-white mt-1 font-medium">
                      {post.comments.length}
                    </div>
                  </div>

                  {/* Bookmark */}
                  <div className="flex flex-col items-center">
                    <button
                      className="bg-black/30 rounded-full p-2 sm:p-3 backdrop-blur-sm touch-manipulation active:scale-95 transition-transform"
                      onClick={() => bookMarkHandler(post)}
                    >
                      {saved ? (
                        <BookmarkIcon
                          className="text-white text-xl sm:text-2xl md:text-3xl"
                        />
                      ) : (
                        <TurnedInNotIcon
                          className="text-white text-xl sm:text-2xl md:text-3xl"
                        />
                      )}
                    </button>
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