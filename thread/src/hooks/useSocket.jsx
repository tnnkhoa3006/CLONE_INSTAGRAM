import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setOnlineUsers } from "../redux/chatSlice";
import { setSocket } from "../redux/socketSlice";
import { setLikeNotification } from "../redux/rtnSlice";
import { createSocket } from "../sockets/socket";
import { setIncomingCall } from "../redux/callSlice";

const useSocket = (user) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?._id) {
      const socketio = createSocket(user._id);

      socketio.on('connect', () => {
        console.log('Socket connected successfully');
      });

      socketio.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      socketio.on('getOnlineUsers', (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketio.on('notification', (notification) => {
        dispatch(setLikeNotification(notification));
      });

      socketio.on('callMade', (data) => {
        dispatch(setIncomingCall(data));
      });

      dispatch(setSocket(socketio));

      return () => {
        socketio.disconnect();
        dispatch(setSocket(null));
      }
    }
  }, [user, dispatch]);
};

export default useSocket;
