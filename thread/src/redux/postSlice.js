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
        },
        optimisticLike: (state, action) => {
            const { postId, userId } = action.payload;
            state.posts = state.posts.map(post =>
                post._id === postId
                    ? {
                        ...post,
                        likes: post.likes.includes(userId)
                            ? post.likes.filter(id => id !== userId)
                            : [...post.likes, userId],
                    }
                    : post
            );
        }
    }
});

export const {setPosts, setSelectedPost, setPostLoading, optimisticLike} = postSlice.actions;
export default postSlice.reducer