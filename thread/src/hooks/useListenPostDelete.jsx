import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '../redux/postSlice';

const useListenPostDelete = () => {
  const dispatch = useDispatch();
  const { posts } = useSelector(store => store.post);
  const socket = useSelector(store => store.socketio.socket);

  useEffect(() => {
    if (!socket) return;

    const handlePostDeleted = ({ postId }) => {
      const updatedPosts = posts.filter(post => post._id !== postId);
      dispatch(setPosts(updatedPosts));
    };

    socket.on("postDeleted", handlePostDeleted);

    return () => {
      socket.off("postDeleted", handlePostDeleted);
    };
  }, [posts, dispatch, socket]);
};

export default useListenPostDelete;
