import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "../redux/postSlice";

const useListenComment = () => {
  const dispatch = useDispatch();
  const { posts } = useSelector(store => store.post);
  const socket = useSelector(store => store.socketio.socket);

  useEffect(() => {
    if (!socket) return;

    const handleNewComment = ({ postId, comment }) => {
      const updatedPosts = posts.map(post =>
        post._id === postId
          ? { ...post, comments: [...(post.comments || []), comment] }
          : post
      );
      dispatch(setPosts(updatedPosts));
    };

    socket.on("newComment", handleNewComment);

    return () => {
      socket.off("newComment", handleNewComment);
    };
  }, [posts, dispatch, socket]);
};

export default useListenComment;
