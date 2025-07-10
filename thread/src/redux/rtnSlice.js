import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
    name: 'realTimeNotification',
    initialState: {
        likeNotifications: []
    },
    reducers: {
        setLikeNotification(state, action) {
            if (action.payload.type === 'like') {
                const exists = state.likeNotifications.some(
                    (item) => item.userId === action.payload.userId && item.postId === action.payload.postId
                );
                if (!exists) {
                    state.likeNotifications.push(action.payload);
                }
            } else if (action.payload.type === 'dislike') {
                state.likeNotifications = state.likeNotifications.filter(
                    (item) => !(item.userId === action.payload.userId && item.postId === action.payload.postId)
                );
            }
        },
    }
})

export const { setLikeNotification } = rtnSlice.actions;
export default rtnSlice.reducer