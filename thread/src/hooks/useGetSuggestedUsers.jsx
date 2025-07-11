import api from "../services/axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"
import { setSuggestedUsers } from "../redux/authSlice.js";


const useGetSuggestedUsers = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);
    
    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            if (!user) return; // Chỉ gọi API khi user đã đăng nhập
            
            try {
                const res = await api.get('/user/suggested', {withCredentials: true});
                if (res.data.success) {
                    dispatch(setSuggestedUsers(res.data.suggestedUsers));
                }
            } catch (error) {
                console.error(error);
            }
        }
        fetchSuggestedUsers();
    }, [dispatch, user]);
}

export default useGetSuggestedUsers;