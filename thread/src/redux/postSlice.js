import { createSlice } from "@reduxjs/toolkit"
const postSlice = createSlice({
    name: 'post',
    initialState: {
        posts: [],
        selectedPost: null,
        loading: false, // Đúng!
    },
    reducers: {
        setPosts: (state, action) => {
            state.posts = action.payload;
            state.loading = false;
        },
        setPostLoading: (state, action) => {
            state.loading = action.payload;
        },
        setSelectedPost: (state, action) => {
            state.selectedPost = action.payload;
        }
    }
});

export const {setPosts, setSelectedPost, setPostLoading} = postSlice.actions;
export default postSlice.reducer