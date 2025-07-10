import axios from "axios";
import { useEffect } from "react";
import { setPosts } from "../redux/postSlice.js";
import { useDispatch, useSelector } from "react-redux"

const useGetAllPost = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);
    
    useEffect(() => {
        const fetchAllPort = async () => {
            if (!user) return; // Chỉ gọi API khi user đã đăng nhập
            
            try {
                const res = await axios.get('/post/all', {withCredentials: true});
                if (res.data.success) {
                    dispatch(setPosts(res.data.posts));
                }
            } catch (error) {
                console.error(error);
            }
        }
        fetchAllPort();
    }, [dispatch, user]);
}

export default useGetAllPost;