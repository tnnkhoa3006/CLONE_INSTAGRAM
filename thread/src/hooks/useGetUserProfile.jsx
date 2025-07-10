import { useDispatch } from "react-redux";
import {setUserProfile} from "../redux/authSlice.js";
import React, { useEffect } from 'react'
import axios from "axios";

const useGetUserProfile = (userId) => {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await axios.get(`/user/profile/${userId}`, {withCredentials: true});
                if (res.data.success) {
                    dispatch(setUserProfile(res.data.user));
                }
            } catch (error) {
                console.error(error);
            }
        }
        fetchUserProfile();
    } , [ userId, dispatch ]);
}

export default useGetUserProfile
