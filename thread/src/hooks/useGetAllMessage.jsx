import api from "../services/axios";
import { useEffect } from "react";
import { setMessages } from "../redux/chatSlice.js";
import { useDispatch, useSelector } from "react-redux"

const useGetAllMessage = () => {
    const dispatch = useDispatch();
    const { selectedUser, user } = useSelector((state) => state.auth);
    
    useEffect(() => {
        const fetchAllMessage = async () => {
            if (!user || !selectedUser?._id) return; // Kiểm tra cả user và selectedUser
            
            try {
                const res = await api.get(`/message/all/${selectedUser._id}`, {withCredentials: true});
                if (res.data.success) {
                    dispatch(setMessages(res.data.messages));
                }
            } catch (error) {
                console.error(error);   
            }
        }
        fetchAllMessage();
    }, [selectedUser, dispatch, user]);
}

export default useGetAllMessage;