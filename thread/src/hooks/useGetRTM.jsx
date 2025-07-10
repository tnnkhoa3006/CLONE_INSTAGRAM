import { useEffect } from "react";
import { setMessages } from "../redux/chatSlice.js";
import { useDispatch, useSelector } from "react-redux"

const useGetRTM = () => {
    const dispatch = useDispatch();
    const { socket } = useSelector(store => store.socketio);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            dispatch((dispatch, getState) => {
                const currentMessages = getState().chat.messages || [];
                dispatch(setMessages([...currentMessages, newMessage]));
            });
        };

        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [socket, dispatch]);
}

export default useGetRTM;