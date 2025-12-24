// thread/src/hooks/useGetAllPost.jsx
import api from "../services/axios";
import { useEffect, useRef } from "react";
import { setPosts, setPostLoading } from "../redux/postSlice.js";
import { useDispatch, useSelector } from "react-redux"

const useGetAllPost = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);
    const hasFetchedRef = useRef(false); // Tránh fetch nhiều lần

    useEffect(() => {
        const fetchAllPost = async () => {
            // Kiểm tra kỹ hơn: user phải có _id và không phải empty object
            if (!user || !user._id || Object.keys(user).length === 0) {
                dispatch(setPostLoading(false));
                hasFetchedRef.current = false;
                return;
            }

            // Chỉ fetch một lần nếu đã fetch rồi
            if (hasFetchedRef.current) {
                return;
            }

            dispatch(setPostLoading(true));
            hasFetchedRef.current = true;
            
            try {
                const res = await api.get('/post/all', { withCredentials: true });
                if (res.data.success) {
                    dispatch(setPosts(res.data.posts));
                } else {
                    dispatch(setPostLoading(false));
                    hasFetchedRef.current = false;
                }
            } catch (error) {
                console.error(error);
                dispatch(setPostLoading(false));
                hasFetchedRef.current = false;
                
                // Nếu là lỗi 401, reset user để tránh loop
                if (error.response?.status === 401) {
                    // Clear user để trigger redirect
                    dispatch({ type: 'auth/setAuthUser', payload: null });
                }
            }
        }
        
        fetchAllPost();
    }, [dispatch, user?._id]); // Chỉ depend vào user._id thay vì toàn bộ user object
}

export default useGetAllPost;