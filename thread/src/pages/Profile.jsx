import React, { useState, useEffect } from 'react'
import SettingsIcon from '@mui/icons-material/Settings';
import GridOnIcon from '@mui/icons-material/GridOn';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import PostSticker from '../components/post.component/postSticker'
import useGetUserProfile from '../hooks/useGetUserProfile';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Profile = () => {
    const [NavBar, setNavBar] = useState(1);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const userId = params.id;
    const { userProfile, user } = useSelector(store => store.auth);
    const isLoggedInUserProfile = userProfile?._id === user._id;
    const isFollowing = true;

    // Gọi custom hook để fetch profile
    useGetUserProfile(userId);

    // Khi userId thay đổi, set loading = true
    useEffect(() => {
        setLoading(true);
    }, [userId]);

    // Khi userProfile đã load xong, set loading = false
    useEffect(() => {
        if (userProfile && userProfile._id === userId) {
            setLoading(false);
        }
    }, [userProfile, userId]);

    const navBarHandler = (index) => {
        setNavBar(index);
    }

    // Hiển thị loading khi đang fetch profile
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-black text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-black text-white" style={{ marginLeft: 240 }}>
            <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col">
                {/* Header + Navbar cố định */}
                <div className="sticky top-0 z-20 bg-black">
                    <header className="w-full p-8 border-b border-zinc-800">
                        <div className="flex items-center gap-10">
                            <div>
                                <img
                                    className="w-32 h-32 object-cover rounded-full border-4 border-zinc-700 hover:border-zinc-500 transition-colors duration-300"
                                    src={userProfile?.ProfilePicture}
                                    alt="avatar" 
                                />
                            </div>
                            <div className="flex-1 space-y-6">
                                <div className="flex items-center gap-6">
                                    <span className="font-normal text-2xl">{userProfile?.username}</span>
                                    {isLoggedInUserProfile ? (
                                        <>
                                            <Link to={`/profile/edit`}>
                                                <button className="px-4 py-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm transition-colors duration-300">Edit profile</button>
                                            </Link>
                                            <button className="px-4 py-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm transition-colors duration-300">View archive</button>
                                            <SettingsIcon style={{ fontSize: 28 }} className="hover:text-zinc-400 transition-colors duration-300" />
                                        </>
                                    ) : (
                                        isFollowing ? (
                                            <>
                                                <button className="px-4 py-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm transition-colors duration-300">Unfollow</button>
                                                <button className="px-4 py-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm transition-colors duration-300">Message</button>
                                            </>
                                        ) : (
                                            <button className="px-4 py-1 rounded-lg bg-blue-700 hover:bg-blue-600 text-sm transition-colors duration-300">Follow</button>
                                        )
                                    )}
                                </div>
                                <div className="flex gap-10">
                                    <div>
                                        <span className="font-semibold">{userProfile?.posts?.length}</span>
                                        <span className="text-zinc-400 pl-1">posts</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold">{userProfile?.followers?.length}</span>
                                        <span className="text-zinc-400 pl-1">followers</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold">{userProfile?.following?.length}</span>
                                        <span className="text-zinc-400 pl-1">following</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="font-medium">{userProfile?.nickname || "nickname"}</div>
                                    <div className="text-sm">{userProfile?.email}</div>
                                    <p className="text-sm">{userProfile?.bio}</p>
                                </div>
                            </div>
                        </div>
                    </header>
                    <nav className="w-full border-b border-zinc-800 bg-black">
                        <div className="flex justify-around">
                            <button onClick={() => navBarHandler(1)} className={`flex items-center gap-2 py-3 px-6 border-b-2 ${NavBar === 1 ? 'border-white' : 'border-transparent'} focus:outline-none transition-colors duration-300`}>
                                <GridOnIcon style={{ fontSize: 24, color: NavBar === 1 ? 'white' : 'gray' }} />
                                <span className={`text-sm ${NavBar === 1 ? 'text-white' : 'text-gray-400'}`}>Posts</span>
                            </button>
                            <button onClick={() => navBarHandler(2)} className={`flex items-center gap-2 py-3 px-6 border-b-2 ${NavBar === 2 ? 'border-white' : 'border-transparent'} focus:outline-none transition-colors duration-300`}>
                                <BookmarkBorderIcon style={{ fontSize: 24, color: NavBar === 2 ? 'white' : 'gray' }} />
                                <span className={`text-sm ${NavBar === 2 ? 'text-white' : 'text-gray-400'}`}>Saved</span>
                            </button>
                            <button onClick={() => navBarHandler(3)} className={`flex items-center gap-2 py-3 px-6 border-b-2 ${NavBar === 3 ? 'border-white' : 'border-transparent'} focus:outline-none transition-colors duration-300`}>
                                <AssignmentIndOutlinedIcon style={{ fontSize: 24, color: NavBar === 3 ? 'white' : 'gray' }} />
                                <span className={`text-sm ${NavBar === 3 ? 'text-white' : 'text-gray-400'}`}>Following</span>
                            </button>
                        </div>
                    </nav>
                </div>
                {/* Content scrollable */}
                <div className="flex-1 bg-black text-white min-h-[200px]">
                    {NavBar === 1 && <PostSticker posts={userProfile?.posts} />}
                    {NavBar === 2 && <PostSticker posts={userProfile?.bookmarks} />}
                    {NavBar === 3 && <div className="p-8 text-center text-zinc-400">No following yet.</div>}
                </div>
            </div>
            <footer className="mt-auto text-center text-zinc-500 text-xs py-3 border-t border-zinc-800">
                © {new Date().getFullYear()} Instagram - App
            </footer>
        </div>
    )
}

export default Profile
