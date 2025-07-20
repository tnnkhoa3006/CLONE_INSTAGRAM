import React, { useState, useEffect } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import GridOnIcon from "@mui/icons-material/GridOn";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PostSticker from "../components/post.component/postSticker";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { followOrUnfollowUser } from "../services/user";
import { setUserProfile, setAuthUser } from "../redux/authSlice";

const Profile = () => {
  const [NavBar, setNavBar] = useState(1);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  const userId = params.id;
  const { userProfile, user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  const isLoggedInUserProfile = userProfile?._id === user._id;
  const isFollowing = userProfile?.followers?.includes(user._id);

  useGetUserProfile(userId);

  useEffect(() => {
    setLoading(true);
  }, [userId]);

  useEffect(() => {
    if (userProfile && userProfile._id === userId) {
      setLoading(false);
    }
  }, [userProfile, userId]);

  const navBarHandler = (index) => {
    setNavBar(index);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      const res = await followOrUnfollowUser(userProfile._id);
      if (res.data.success) {
        let updatedFollowers;
        let updatedFollowing;
        if (isFollowing) {
          updatedFollowers = userProfile.followers.filter((id) => id !== user._id);
          updatedFollowing = user.following.filter(
            (f) => (typeof f === "object" ? f._id : f) !== userProfile._id
          );
        } else {
          updatedFollowers = [...userProfile.followers, user._id];
          updatedFollowing = [
            ...user.following,
            typeof user.following[0] === "object"
              ? { _id: userProfile._id, username: userProfile.username, ProfilePicture: userProfile.ProfilePicture }
              : userProfile._id,
          ];
        }
        dispatch(setUserProfile({ ...userProfile, followers: updatedFollowers }));
        dispatch(setAuthUser({ ...user, following: updatedFollowing }));
      }
    } catch (err) {
      // handle error if needed
    }
    setFollowLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen flex flex-col overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto flex-grow flex flex-col">
        {/* Header + Navbar */}
        <div className="sticky top-12 z-[10] bg-black">
          <div className="md:hidden flex items-center p-4 border-b border-zinc-800">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full hover:bg-zinc-800 transition-colors duration-300"
            >
              <ArrowBackIcon style={{ fontSize: 24 }} />
            </button>
            <span className="ml-4 text-lg font-medium">{userProfile?.username}</span>
          </div>

          <header className="w-full p-4 md:p-8 border-b border-zinc-800">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-10">
              <div className="w-24 h-24 md:w-32 md:h-32">
                <img
                  className="w-full h-full object-cover rounded-full border-4 border-zinc-700 hover:border-zinc-500 transition-colors duration-300"
                  src={userProfile?.ProfilePicture}
                  alt="avatar"
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                />
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                  <span className="font-normal text-xl md:text-2xl">{userProfile?.username}</span>
                  {isLoggedInUserProfile ? (
                    <div className="flex items-center gap-4">
                      <Link to={`/profile/edit`}>
                        <button className="px-3 py-1 md:px-4 md:py-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm transition-colors duration-300">
                          Edit profile
                        </button>
                      </Link>
                      <button className="px-3 py-1 md:px-4 md:py-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm transition-colors duration-300">
                        View archive
                      </button>
                      <SettingsIcon
                        style={{ fontSize: 24, md: { fontSize: 28 } }}
                        className="hover:text-zinc-400 transition-colors duration-300"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <button
                        className={`px-3 py-1 md:px-4 md:py-1 rounded-lg text-sm transition-colors duration-300 ${isFollowing
                            ? "bg-zinc-700 hover:bg-zinc-600"
                            : "bg-blue-700 hover:bg-blue-600 text-white"
                          }`}
                        onClick={handleFollow}
                        disabled={followLoading}
                      >
                        {isFollowing ? "Unfollow" : "Follow"}
                      </button>
                      <button className="px-3 py-1 md:px-4 md:py-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm transition-colors duration-300">
                        Message
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex md:flex-row justify-center md:justify-start gap-4 md:gap-10">
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
              <button
                onClick={() => navBarHandler(1)}
                className={`flex items-center gap-2 py-2 px-4 border-b-2 ${NavBar === 1 ? "border-white" : "border-transparent"
                  } focus:outline-none transition-colors duration-300`}
              >
                <GridOnIcon style={{ fontSize: 20 }} />
                <span className={`text-sm ${NavBar === 1 ? "text-white" : "text-gray-400"}`}>Posts</span>
              </button>
              <button
                onClick={() => navBarHandler(2)}
                className={`flex items-center gap-2 py-2 px-4 border-b-2 ${NavBar === 2 ? "border-white" : "border-transparent"
                  } focus:outline-none transition-colors duration-300`}
              >
                <BookmarkBorderIcon style={{ fontSize: 20 }} />
                <span className={`text-sm ${NavBar === 2 ? "text-white" : "text-gray-400"}`}>Saved</span>
              </button>
              <button
                onClick={() => navBarHandler(3)}
                className={`flex items-center gap-2 py-2 px-4 border-b-2 ${NavBar === 3 ? "border-white" : "border-transparent"
                  } focus:outline-none transition-colors duration-300`}
              >
                <AssignmentIndOutlinedIcon style={{ fontSize: 20 }} />
                <span className={`text-sm ${NavBar === 3 ? "text-white" : "text-gray-400"}`}>Following</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Content scrolls as part of the page */}
        <div className="bg-black text-white p-2 md:p-4">
          {NavBar === 1 && <PostSticker posts={userProfile?.posts} />}
          {NavBar === 2 && <PostSticker posts={userProfile?.bookmarks} />}
          {NavBar === 3 && <div className="p-2 md:p-4 text-center text-zinc-400">No following yet.</div>}
        </div>
      </div>

      <footer className="text-center text-zinc-500 text-xs py-2 border-t border-zinc-800">
        © {new Date().getFullYear()} Instagram - App
      </footer>
    </div>
  );
};

export default Profile;
