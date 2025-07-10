import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { setAuthUser } from '../redux/authSlice.js';


const EditProfile = () => {
    const imageRef = useRef();
    const { user } = useSelector(store => store.auth);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState({
        profilePhoto: user?.ProfilePicture,
        bio: user?.bio,
        gender: user?.gender
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) setInput({ ...input, profilePhoto: file });
    }
    
    const selectChangeHandler = (e) => setInput({ ...input, gender: e.target.value });

    const editProfileHandler = async () => {
        const formData = new FormData();
        if (input.profilePhoto) formData.append("profilePhoto", input.profilePhoto);
        formData.append("bio", input.bio);
        formData.append("gender", input.gender);
        try {
            setLoading(true);
            const res = await axios.post(`/user/profile/edit`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });
            if (res.data.success) {
                const updatedUserData = {
                    ...user,
                    ProfilePicture: res.data.user.ProfilePicture,
                    bio: res.data.user.bio,
                    gender: res.data.user.gender
                };
                dispatch(setAuthUser(updatedUserData));
                toast.success(res.data.message);
                navigate(`/profile/${user?._id}`);
            }
        } catch (error) {
            console.log(error);
        } 
    }
    return (
        <div className='text-white flex h-screen'>
            <div className='flex w-full max-w-5xl mx-auto justify-center pt-16'>
                <div className='flex-1 flex-col max-w-2xl space-y-6'>
                    <h1 className='font-bold text-xl'>Edit profile </h1>
                    <div className="flex h-[100px] rounded-3xl items-center mb-8 bg-zinc-800">
                        <Link to={`/profile/${user?._id}`}>
                            <img
                                className="w-[50px] h-[50px] object-cover rounded-full"
                                src={user?.ProfilePicture}
                                alt="profile"
                            />
                        </Link>
                        <div className="flex flex-col justify-center pl-4 flex-1">
                            <Link to={`/profile/${user?._id}`}>
                                <span className="text-white text-sm font-semibold cursor-pointer">{user?.username}</span>
                            </Link>
                            <span className="text-gray-400 text-xs">@realChad🗿</span>
                        </div>
                        <input onChange={fileChangeHandler} ref={imageRef} type="file" className='hidden' />
                        <button onClick={() => imageRef?.current.click()} className="text-white mr-4 h-8 text-sm font-semibold bg-blue-700 hover:bg-blue-500 rounded-lg justify-center px-4">Change photo</button>
                    </div>
                    <div className='flex flex-col space-y-4'>
                        <h1 className='font-bold text-lg'>Bio</h1>
                        <textarea value={input.bio} onChange={(e) => setInput({ ...input, bio: e.target.value })}  className='w-full bg-black rounded-2xl p-4 border-[1px] border-zinc-800'></textarea>
                    </div>
                    <div className='flex flex-col space-y-4'>
                        <h1 className='font-bold text-lg'>Gender</h1>
                        <select value={input.gender} onChange={selectChangeHandler} name='gender' className='w-full bg-black rounded-2xl p-4 border-[1px] border-zinc-800'>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className='flex justify-end'>
                        {loading ?
                            (
                                <button className='text-white h-10 text-sm font-semibold bg-blue-700 hover:bg-blue-500 rounded-lg justify-center px-20'>Loading...</button>
                            )
                            :
                            (
                                <button onClick={editProfileHandler} className='text-white h-10 text-sm font-semibold bg-blue-700 hover:bg-blue-500 rounded-lg justify-center px-20'>Submit</button>
                            )
                        }

                    </div>
                </div>
            </div>
        </div >
    )
}

export default EditProfile
