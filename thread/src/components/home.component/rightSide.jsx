import { Link } from 'react-router-dom';
import api from '../../services/axios';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { setAuthUser } from '../../redux/authSlice.js';
import useGetSuggestedUsers from '../../hooks/useGetSuggestedUsers.jsx';
import { followOrUnfollowUser } from '../../services/user';
import { useState } from 'react';

const RightSide = () => {
  const dispatch = useDispatch();
  const { user, suggestedUsers } = useSelector((store) => store.auth);
  useGetSuggestedUsers();

  // State to control display limit
  const [showAll, setShowAll] = useState(false);
  const SUGGESTED_LIMIT = 6;
  const MAX_SUGGESTED_USERS = 50;

  // Filter displayed users
  // Filter and then limit suggested users
  const filteredSuggested = (suggestedUsers || [])
    .filter(
      (sugUser) =>
        !user?.following?.some(
          (f) => (typeof f === 'object' ? f._id === sugUser._id : f === sugUser._id)
        )
    )
    .slice(0, MAX_SUGGESTED_USERS); // Giới hạn tối đa 50 người

  const displayedUsers = showAll
    ? filteredSuggested
    : filteredSuggested.slice(0, SUGGESTED_LIMIT);

  const [loadingFollow, setLoadingFollow] = useState(false);

  const handleFollow = async (sugUser) => {
    setLoadingFollow(true);
    try {
      await followOrUnfollowUser(sugUser._id);
      const res = await api.get(`/user/profile/${user._id}`, { withCredentials: true });
      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
      }
    } catch (err) {
      toast.error('Error following user');
    } finally {
      setLoadingFollow(false);
    }
  };

  return (
    <div className="hidden md:block w-[380px] px-4 pt-8 bg-black">
      {/* User info */}
      <div className="flex items-center mb-6 md:mb-8">
        <Link to={`/profile/${user?._id}`}>
          <img
            className="w-[50px] h-[50px] object-cover rounded-full"
            src={user?.ProfilePicture || '/default-avatar.png'} // Fallback image
            alt="profile"
            onError={(e) => {
              e.target.src = '/default-avatar.png'; // Fallback if image fails
            }}
          />
        </Link>
        <div className="flex flex-col justify-center pl-3 md:pl-4 flex-1">
          <Link to={`/profile/${user?._id}`}>
            <span className="text-white text-sm font-semibold cursor-pointer">{user?.username}</span>
          </Link>
          <span className="text-gray-400 text-xs">@realChad🗿</span>
        </div>
        <span className="text-blue-400 font-medium text-xs cursor-pointer hover:underline hover:text-blue-300">
          Switch
        </span>
      </div>
      {/* Suggested users */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Suggested for you</span>
          {suggestedUsers && suggestedUsers.length > SUGGESTED_LIMIT && (
            <span
              className="text-white text-xs font-semibold hover:text-zinc-500 cursor-pointer"
              onClick={() => setShowAll((prev) => !prev)}
            >
              {showAll ? 'Show less' : 'See All'}
            </span>
          )}
        </div>
        {suggestedUsers && suggestedUsers.length > 0 ? (
          displayedUsers
            .filter(
              (sugUser) =>
                !user?.following?.some(
                  (f) => (typeof f === 'object' ? f._id === sugUser._id : f === sugUser._id)
                )
            )
            .map((sugUser) => (
              <div key={sugUser._id} className="flex items-center mt-3 pl-2 md:pl-3">
                <Link to={`/profile/${sugUser._id}`}>
                  <img
                    className="w-[40px] h-[40px] object-cover rounded-full border-2 border-r-pink-500 border-b-purple-400 border-l-yellow-400 border-t-orange-400 cursor-pointer"
                    src={sugUser.ProfilePicture || '/default-avatar.png'} // Fallback image
                    alt="suggested"
                    onError={(e) => {
                      e.target.src = '/default-avatar.png'; // Fallback if image fails
                    }}
                  />
                </Link>
                <div className="flex flex-col justify-center pl-2 md:pl-3 flex-1">
                  <Link to={`/profile/${sugUser._id}`}>
                    <span className="text-white text-sm font-semibold cursor-pointer">{sugUser.username}</span>
                  </Link>
                  <span className="text-gray-400 text-xs">Suggested for you</span>
                </div>
                <span
                  className="text-blue-400 font-medium text-xs cursor-pointer ml-1 md:ml-2 hover:text-blue-300"
                  onClick={() => handleFollow(sugUser)}
                >
                  {loadingFollow ? "..." : "Follow"}
                </span>
              </div>
            ))
        ) : (
          <div className="text-gray-400 text-sm pl-2 mt-2">No suggestions</div>
        )}
      </div>
    </div>
  );
};

export default RightSide;