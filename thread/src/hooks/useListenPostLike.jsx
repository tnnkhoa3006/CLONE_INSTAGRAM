import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "../redux/postSlice";// Đảm bảo bạn đã khởi tạo socket

const useListenPostLike = () => {
  const dispatch = useDispatch();
  const { posts } = useSelector(store => store.post);
  const socket = useSelector(store => store.socketio.socket);

  useEffect(() => {
    if (!socket) return;

    const handlePostLikeUpdated = ({ postId, likes }) => {
      const updatedPosts = posts.map(post =>
        post._id === postId ? { ...post, likes } : post
      );
      dispatch(setPosts(updatedPosts));
    };

    socket.on("postLikeUpdated", handlePostLikeUpdated);

    return () => {
      socket.off("postLikeUpdated", handlePostLikeUpdated);
    };
  }, [posts, dispatch, socket]);
};

export default useListenPostLike;
