import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/axios';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { setAuthUser } from '../../redux/authSlice.js';
import { setPosts } from '../../redux/postSlice.js';
import useGetSuggestedUsers from '../../hooks/useGetSuggestedUsers.jsx';
import { followOrUnfollowUser } from '../../services/user';

const RightSide = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, suggestedUsers } = useSelector(store => store.auth);
  useGetSuggestedUsers();

  const handleFollow = async (sugUser) => {
    try {
      await followOrUnfollowUser(sugUser._id);
      dispatch(setAuthUser({
        ...user,
        following: [
          ...user.following,
          typeof user.following[0] === 'object'
            ? { _id: sugUser._id, username: sugUser.username, ProfilePicture: sugUser.ProfilePicture }
            : sugUser._id
        ]
      }));
    } catch (err) {
      toast.error('Error following user');
    }
  };

  const logoutHandler = async () => {
    try {
      const res = await api.get('/user/logout', { withCredentials: true });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setPosts([]));
        navigate('/login');
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }

  return (
    <div className="w-[380px] px-4 pt-8">
      {/* User info */}
      <div className="flex items-center mb-8">
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
        <span className="text-blue-400 font-medium text-xs cursor-pointer hover:underline hover:text-blue-300">Switch</span>
      </div>
      {/* Suggested users */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Suggested for you</span>
          <span className="text-white text-xs font-semibold hover:text-zinc-500 cursor-pointer">See All</span>
        </div>
        {suggestedUsers && suggestedUsers.length > 0 ? (
          suggestedUsers
            .filter(sugUser =>
              !user?.following?.some(f =>
                typeof f === 'object' ? f._id === sugUser._id : f === sugUser._id
              )
            )
            .map((sugUser) => (
              <div key={sugUser._id} className="flex items-center mt-3 pl-3">
                <Link to={`/profile/${sugUser._id}`}>
                  <img
                    className="w-[40px] h-[40px] object-cover rounded-full border-2 border-r-pink-500 border-b-purple-400 border-l-yellow-400 border-t-orange-400 cursor-pointer"
                    src={sugUser.ProfilePicture}
                    alt="suggested"
                  />
                </Link>
                <div className="flex flex-col justify-center pl-3 flex-1">
                  <Link to={`/profile/${sugUser._id}`}>
                    <span className="text-white text-sm font-semibold cursor-pointer">{sugUser.username}</span>
                  </Link>
                  <span className="text-gray-400 text-xs">Suggested for you</span>
                </div>
                <span
                  className="text-blue-400 font-medium text-xs cursor-pointer ml-2 hover:text-blue-300"
                  onClick={() => handleFollow(sugUser)}
                >
                  Follow
                </span>
              </div>
            ))
        ) : (
          <div className="text-gray-400 text-sm pl-2 mt-2">No suggestions</div>
        )}
      </div>
      {/* Logout */}
      <div className="pt-8">
        <div onClick={logoutHandler} className="flex items-center space-x-2 cursor-pointer hover:bg-zinc-800 rounded-md px-4 py-2 w-fit">
          <ExitToAppIcon style={{ fontSize: 24 }} />
          <span className="text-base font-medium">Logout</span>
        </div>
      </div>
    </div>
  )
}

export default RightSide
