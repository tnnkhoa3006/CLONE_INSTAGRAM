import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        onlineUsers: [],
        messages: [],
    },
    reducers: {
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        },
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        markAllAsRead: (state, action) => {
            state.messages = state.messages.map(msg =>
                msg.receiverId === action.payload ? { ...msg, read: true } : msg
            );
        }
    }
});

export const { setOnlineUsers, setMessages, markAllAsRead } = chatSlice.actions;
export default chatSlice.reducer