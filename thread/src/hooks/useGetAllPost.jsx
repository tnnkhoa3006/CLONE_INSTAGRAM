import api from "../services/axios";
import { useEffect } from "react";
import { setPosts, setPostLoading } from "../redux/postSlice.js";
import { useDispatch, useSelector } from "react-redux"

const useGetAllPost = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);

    useEffect(() => {
        const fetchAllPost = async () => {
            if (!user) {
                dispatch(setPostLoading(false));
                return;
            }
            dispatch(setPostLoading(true));
            try {
                const res = await api.get('/post/all', { withCredentials: true });
                if (res.data.success) {
                    dispatch(setPosts(res.data.posts));
                } else {
                    dispatch(setPostLoading(false));
                }
            } catch (error) {
                console.error(error);
                dispatch(setPostLoading(false));
            }
        }
        fetchAllPost();
    }, [dispatch, user]);
}

export default useGetAllPost;