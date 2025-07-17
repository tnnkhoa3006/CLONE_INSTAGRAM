import { useDispatch } from "react-redux";
import { setUserProfile } from "../redux/authSlice.js";
import React, { useEffect } from 'react'
import api from "../services/axios";

const useGetUserProfile = (userId) => {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!userId) {
                return;
            };
            try {
                const res = await api.get(`/user/profile/${userId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setUserProfile(res.data.user));
                }
            } catch (error) {
                console.error(error);
            }
        }
        fetchUserProfile();
    }, [userId, dispatch]);
}

export default useGetUserProfile
