import React, { use, useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import instagram from '../../assets/instagram.png'
import Instagramlogo from '../../assets/instagramlogo.png'
import HomeIcon from '@mui/icons-material/Home';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ExploreIcon from '@mui/icons-material/Explore';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay';
import SlideshowOutlinedIcon from '@mui/icons-material/SlideshowOutlined';
import SendIcon from '@mui/icons-material/Send';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MenuIcon from '@mui/icons-material/Menu';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import GestureIcon from '@mui/icons-material/Gesture';
import Dialogaddpost from '../modals/dialogaddpost';
import NotificationPanel from '../modals/NotificationPanel';

const LeftSide = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showAddPost, setShowAddPost] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasSeenNotifications, setHasSeenNotifications] = useState(() => {
    return localStorage.getItem('hasSeenNotifications') === 'true';
  });
  const { user } = useSelector(store => store.auth)
  const { likeNotifications } = useSelector(store => store.realTimeNotification)
  const notificationRef = useRef(null);

  const isHome = location.pathname === '/';
  const isMessages = location.pathname === '/messages';

  // Đóng panel khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // Khi mở panel notification, đánh dấu đã xem
  useEffect(() => {
    if (showNotifications) {
      setHasSeenNotifications(true);
      localStorage.setItem('hasSeenNotifications', 'true');
      localStorage.setItem('lastSeenNotificationCount', likeNotifications.length);
    }
  }, [showNotifications, likeNotifications.length]);

  // Khi panel mở, sidebar width nhỏ lại, chỉ hiện icon
  const sidebarWidth = showNotifications ? "w-[80px]" : "w-[245px]";
  const textHidden = showNotifications ? "hidden" : "inline";

  useEffect(() => {
    const lastSeen = Number(localStorage.getItem('lastSeenNotificationCount') || 0);
    if (likeNotifications.length > lastSeen) {
      setHasSeenNotifications(false);
      localStorage.setItem('hasSeenNotifications', 'false');
    }
  }, [likeNotifications]);

  const { messages } = useSelector(store => store.chat);
  const unreadCount = user ? messages?.filter(msg => !msg.read && msg.receiverId === user._id).length : 0;

  if (!user) return null; // hoặc return loading UI

  return (
    <>
      <div className={`flex h-screen top-0 left-0 ${sidebarWidth} z-50 border-r border-zinc-700 transition-all duration-300`}>
        <div className="relative w-full h-full">
          <Link to="/">
            {showNotifications ? (
              <img
                title="Instagram"
                src={instagram}
                alt="Instagram"
                className="absolute top-[40px] left-[35px] bg-white rounded-3xl transform -translate-x-1/2 cursor-pointer w-8 transition-all duration-300"
              />
            ) : (
              <img
                title="Instagram"
                src={Instagramlogo}
                alt="Instagram"
                className="absolute top-[40px] left-[70px] transform -translate-x-1/2 cursor-pointer w-24 transition-all duration-300"
              />
            )}
          </Link>
          <div className="absolute top-[100px] left-[10px] w-full space-y-1.5">
            <div
              className={`w-[220px] h-[50px] flex items-center space-x-2 hover:cursor-pointer hover:bg-zinc-800 rounded-md px-2`}
              onClick={() => navigate('/')}
            >
              {isHome ? (
                <HomeIcon style={{ fontSize: 30, color: "#fff" }} />
              ) : (
                <HomeOutlinedIcon style={{ fontSize: 30, color: "#fff" }} />
              )}
              <div className={`text-[16px] font-bold ${textHidden} ${isHome ? "text-white" : "text-white"}`}>Home</div>
            </div>
            <div className="w-[220px] h-[50px] flex items-center space-x-2 hover:cursor-pointer hover:bg-zinc-800 rounded-md px-2">
              <SearchIcon style={{ fontSize: 30 }} />
              <div className={`text-[16px] font-medium ${textHidden}`}>Search</div>
            </div>
            <div className="w-[220px] h-[50px] flex items-center space-x-2 hover:cursor-pointer hover:bg-zinc-800 rounded-md px-2">
              <ExploreOutlinedIcon style={{ fontSize: 30 }} />
              <div className={`text-[16px] font-medium ${textHidden}`}>Explore</div>
            </div>
            <div className="w-[220px] h-[50px] flex items-center space-x-2 hover:cursor-pointer hover:bg-zinc-800 rounded-md px-2">
              <SlideshowOutlinedIcon style={{ fontSize: 30 }} />
              <div className={`text-[16px] font-bold ${textHidden}`}>Reels</div>
            </div>
            <div className="w-[220px] h-[50px] flex items-center space-x-2 hover:cursor-pointer hover:bg-zinc-800 rounded-md px-2">
              <div className="relative" onClick={() => navigate('/messages')}>
                {isMessages ? (
                  <SendIcon style={{ fontSize: 30, color: "#fff" }} />
                ) : (
                  <SendOutlinedIcon style={{ fontSize: 30, color: "#fff" }} />
                )}
                {(unreadCount > 0) && (
                  <div className="absolute top-1 -right-1 w-[10px] h-[10px] bg-red-500 rounded-full z-10"></div>
                )}
              </div>
              <div className={`text-[16px] font-medium ${textHidden} ${isMessages ? "text-white" : "text-white"}`}>Messages</div>
            </div>
            <div className="w-[220px] h-[50px] flex items-center space-x-2 hover:cursor-pointer hover:bg-zinc-800 rounded-md px-2 relative">
              <div
                className="relative"
                onClick={e => {
                  e.stopPropagation();
                  setShowNotifications(prev => !prev);
                }}
                style={{ cursor: "pointer" }}
              >
                {showNotifications ? (
                  <FavoriteIcon style={{ fontSize: 30, color: "#fff" }} />
                ) : (
                  <FavoriteBorderIcon style={{ fontSize: 30, color: "#fff" }} />
                )}
                {likeNotifications && likeNotifications.length > 0 && !hasSeenNotifications && (
                  <div className="absolute top-1 -right-1 w-[10px] h-[10px] bg-red-500 rounded-full z-10"></div>
                )}
              </div>
              <div className={`text-[16px] font-medium ${textHidden}`}>Notifications</div>
            </div>
            <div className="w-[220px] h-[50px] flex items-center space-x-2 hover:cursor-pointer hover:bg-zinc-800 rounded-md px-2" onClick={() => setShowAddPost(true)}>
              <AddCircleOutlineIcon style={{ fontSize: 30 }} />
              <div className={`text-[16px] font-medium ${textHidden}`}>Create</div>
            </div>
            <div className="w-[220px] h-[50px] flex items-center space-x-2 hover:cursor-pointer hover:bg-zinc-800 rounded-md px-2" onClick={() => user && navigate(`/profile/${user._id}`)}>
              <img className="w-[30px] h-[30px] rounded-full" src={user?.ProfilePicture || ''} alt="profile image" />
              <div className={`text-[16px] font-medium ${textHidden}`}>Profile</div>
            </div>
            <div className="absolute top-[450px] space-y-2">
              <div className="w-[220px] h-[50px] flex items-center space-x-2 hover:cursor-pointer hover:bg-zinc-800 rounded-md px-2">
                <PanoramaFishEyeIcon style={{ fontSize: 30 }} />
                <div className={`text-[16px] font-medium ${textHidden}`}>Meta AI</div>
              </div>
              <div className="w-[220px] h-[50px] flex items-center space-x-2 hover:cursor-pointer hover:bg-zinc-800 rounded-md px-2">
                <GestureIcon style={{ fontSize: 30 }} />
                <div className={`text-[16px] font-medium ${textHidden}`}>Threads</div>
              </div>
              <div className="w-[220px] h-[50px] flex items-center space-x-2 hover:cursor-pointer hover:bg-zinc-800 rounded-md px-2">
                <MenuIcon style={{ fontSize: 30 }} />
                <div className={`text-[16px] font-medium ${textHidden}`}>More</div>
              </div>
            </div>
          </div>
          <Dialogaddpost isopen={showAddPost} onClose={() => setShowAddPost(false)} />
        </div>
      </div>
      {showNotifications && (
        <NotificationPanel
          ref={notificationRef}
          likeNotifications={likeNotifications}
        />
      )}
    </>
  )
}

export default LeftSide
