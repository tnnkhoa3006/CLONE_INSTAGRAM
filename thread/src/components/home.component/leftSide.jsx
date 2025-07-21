import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import instagram from '../../assets/instagram.png';
import Instagramlogo from '../../assets/instagramlogo.png';
import HomeIcon from '@mui/icons-material/Home';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SearchIcon from '@mui/icons-material/Search'; // Re-added for Search
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
import SearchPanel from '../modals/SearchPanel';
import MoreModal from '../modals/dialogmore';

const LeftSide = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAddPost, setShowAddPost] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [hasSeenNotifications, setHasSeenNotifications] = useState(() => {
    return localStorage.getItem('hasSeenNotifications') === 'true';
  });
  const { user, suggestedUsers } = useSelector((store) => store.auth);
  const { likeNotifications } = useSelector((store) => store.realTimeNotification);
  const { messages } = useSelector((store) => store.chat);
  const notificationRef = useRef(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);
  const searchButtonRef = useRef(null);

  const isHome = location.pathname === '/';
  const isMessages = location.pathname === '/messages';
  const unreadCount = user
    ? messages?.filter((msg) => !msg.read && msg.receiverId === user._id).length
    : 0;

  // Close panels when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;

      // Đóng notification nếu click ngoài
      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }

      // Đóng search nếu click ngoài, nhưng KHÔNG phải chính nút search
      if (
        searchRef.current &&
        !searchRef.current.contains(target) &&
        searchButtonRef.current &&
        !searchButtonRef.current.contains(target)
      ) {
        setShowSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Mark notifications as seen when panel is opened
  useEffect(() => {
    if (showNotifications) {
      setHasSeenNotifications(true);
      localStorage.setItem('hasSeenNotifications', 'true');
      localStorage.setItem('lastSeenNotificationCount', likeNotifications.length);
    }
  }, [showNotifications, likeNotifications.length]);

  // Update notification status when new notifications arrive
  useEffect(() => {
    const lastSeen = Number(localStorage.getItem('lastSeenNotificationCount') || 0);
    if (likeNotifications.length > lastSeen) {
      setHasSeenNotifications(false);
      localStorage.setItem('hasSeenNotifications', 'false');
    }
  }, [likeNotifications]);

  // Handle profile navigation
  const handleProfile = () => {
    if (user) {
      navigate(`/profile/${user._id}`);
    }
  };

  // Handle search
  const handleSearch = (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    const results = (suggestedUsers || []).filter((u) =>
      u.username.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  if (!user) return null; // Or return a loading UI

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex fixed h-screen top-0 left-0 ${showNotifications || showSearch ? 'w-[80px] pl-2' : 'w-[245px]'
          } z-50 border-r border-zinc-700 bg-black transition-all duration-300 flex-col`}
      >
        <div className="relative w-full h-full flex flex-col items-center pt-6">
          <Link to="/" className="mb-8">
            <img
              title="Instagram"
              src={showNotifications || showSearch ? instagram : Instagramlogo}
              alt="Instagram"
              className={`${showNotifications || showSearch ? 'w-10 rounded-3xl ml-2' : 'w-28 mr-14'
                } cursor-pointer transition-all duration-300`}
            />
          </Link>
          <div className="w-full space-y-4 px-3">
            <div
              className={`w-full h-12 flex items-center space-x-4 hover:bg-zinc-800 rounded-md py-2 px-3 cursor-pointer`}
              onClick={() => navigate('/')}
            >
              {isHome ? (
                <HomeIcon style={{ fontSize: 30, color: '#fff' }} />
              ) : (
                <HomeOutlinedIcon style={{ fontSize: 30, color: '#fff' }} />
              )}
              <div
                className={`text-sm font-medium ${showNotifications || showSearch ? 'hidden' : 'inline'
                  } ${isHome ? 'text-white' : 'text-gray-400'}`}
              >
                Home
              </div>
            </div>
            <div
              ref={searchButtonRef}
              className="w-full h-12 flex items-center space-x-4 hover:bg-zinc-800 rounded-md px-3 cursor-pointer"
              onClick={() => {
                setShowSearch((prev) => !prev); // Toggle trạng thái
                setShowNotifications(false);    // Tắt notification nếu đang mở
              }}
            >
              <SearchIcon style={{ fontSize: 30, color: '#fff' }} />
              <div
                className={`text-sm font-medium ${showNotifications || showSearch ? 'hidden' : 'inline'
                  } text-gray-400`}
              >
                Search
              </div>
            </div>
            <div className="w-full h-12 flex items-center space-x-4 hover:bg-zinc-800 rounded-md px-3 cursor-pointer"
              onClick={() => navigate('/reels')}
            >
              <SlideshowOutlinedIcon style={{ fontSize: 30, color: '#fff' }} />
              <div
                className={`text-sm font-medium ${showNotifications || showSearch ? 'hidden' : 'inline'
                  } text-gray-400`}
              >
                Reels
              </div>
            </div>
            <div
              className="w-full h-12 flex items-center space-x-4 hover:bg-zinc-800 rounded-md px-3 cursor-pointer"
              onClick={() => navigate('/messages')}
            >
              <div className="relative">
                {isMessages ? (
                  <SendIcon style={{ fontSize: 30, color: '#fff' }} />
                ) : (
                  <SendOutlinedIcon style={{ fontSize: 30, color: '#fff' }} />
                )}
                {unreadCount > 0 && (
                  <div className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full z-10"></div>
                )}
              </div>
              <div
                className={`text-sm font-medium ${showNotifications || showSearch ? 'hidden' : 'inline'
                  } ${isMessages ? 'text-white' : 'text-gray-400'}`}
              >
                Messages
              </div>
            </div>
            <div
              className="w-full h-12 flex items-center space-x-4 hover:bg-zinc-800 rounded-md px-3 cursor-pointer relative"
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications((prev) => !prev);
                setShowSearch(false);
              }}
            >
              <div className="relative">
                {showNotifications ? (
                  <FavoriteIcon style={{ fontSize: 30, color: '#fff' }} />
                ) : (
                  <FavoriteBorderIcon style={{ fontSize: 30, color: '#fff' }} />
                )}
                {likeNotifications?.length > 0 && !hasSeenNotifications && (
                  <div className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full z-10"></div>
                )}
              </div>
              <div
                className={`text-sm font-medium ${showNotifications || showSearch ? 'hidden' : 'inline'
                  } text-gray-400`}
              >
                Notifications
              </div>
            </div>
            <div
              className="w-full h-12 flex items-center space-x-4 hover:bg-zinc-800 rounded-md px-3 cursor-pointer"
              onClick={() => setShowAddPost(true)}
            >
              <AddCircleOutlineIcon style={{ fontSize: 30, color: '#fff' }} />
              <div
                className={`text-sm font-medium ${showNotifications || showSearch ? 'hidden' : 'inline'
                  } text-gray-400`}
              >
                Create
              </div>
            </div>
            <div
              className="w-full h-12 flex items-center space-x-4 hover:bg-zinc-800 rounded-md px-3 cursor-pointer"
              onClick={handleProfile}
            >
              <img
                className="w-7 h-7 rounded-full object-cover"
                src={user?.ProfilePicture || ''}
                alt="profile image"
              />
              <div
                className={`text-sm font-medium ${showNotifications || showSearch ? 'hidden' : 'inline'
                  } text-gray-400`}
              >
                Profile
              </div>
            </div>
            <div className="w-full space-y-1.5 pt-10 mt-auto">
              <div className="w-full h-12 flex items-center space-x-4 hover:bg-zinc-800 rounded-md px-3 cursor-pointer">
                <PanoramaFishEyeIcon style={{ fontSize: 30, color: '#fff' }} />
                <div
                  className={`text-sm font-medium ${showNotifications || showSearch ? 'hidden' : 'inline'
                    } text-gray-400`}
                >
                  Meta AI
                </div>
              </div>
              <div className="w-full h-12 flex items-center space-x-4 hover:bg-zinc-800 rounded-md px-3 cursor-pointer">
                <GestureIcon style={{ fontSize: 30, color: '#fff' }} />
                <div
                  className={`text-sm font-medium ${showNotifications || showSearch ? 'hidden' : 'inline'
                    } text-gray-400`}
                >
                  Threads
                </div>
              </div>
              <div
                className="w-full h-12 flex items-center space-x-4 hover:bg-zinc-800 rounded-md px-3 cursor-pointer"
                onClick={() => setShowMore(true)}
              >
                <MenuIcon style={{ fontSize: 30, color: '#fff' }} />
                <div
                  className={`text-sm font-medium ${showNotifications || showSearch ? 'hidden' : 'inline'} text-gray-400`}
                >
                  More
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 w-full h-14 bg-black border-b border-zinc-700 z-[5] flex items-center justify-between px-4">
        <Link to="/">
          <img src={Instagramlogo} alt="Instagram" className="w-24" />
        </Link>
        <div className="flex space-x-4">
          <div onClick={() => setShowSearch(true)} className="p-1 hover:bg-zinc-800 rounded-md">
            <SearchIcon style={{ fontSize: 26, color: '#fff' }} />
          </div>
          <div
            onClick={() => {
              setShowNotifications(prev => !prev);
              setShowSearch(false);
            }}
            className="relative p-1 hover:bg-zinc-800 rounded-md"
          >
            <FavoriteBorderIcon style={{ fontSize: 26, color: '#fff' }} />
            {likeNotifications?.length > 0 && !hasSeenNotifications && (
              <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </div>
          <div onClick={() => setShowMore(true)} className="p-1 hover:bg-zinc-800 rounded-md">
            <MenuIcon style={{ fontSize: 26, color: '#fff' }} />
          </div>
        </div>
      </div>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed px-auto left-0 bottom-0 w-full h-16 bg-black border-t border-zinc-700 z-50 flex justify-around items-center">
        <div
          className="flex items-center justify-center p-2 hover:bg-zinc-800 rounded-md"
          onClick={() => navigate('/')}
        >
          {isHome ? (
            <HomeIcon style={{ fontSize: 28, color: '#fff' }} />
          ) : (
            <HomeOutlinedIcon style={{ fontSize: 28, color: '#fff' }} />
          )}
        </div>
        <div
          onClick={() => navigate('/reels')}
          className="flex items-center justify-center p-2 hover:bg-zinc-800 rounded-md relative"
        >
          <SlideshowOutlinedIcon style={{ fontSize: 28, color: '#fff' }} />
        </div>
        <div
          className="flex items-center justify-center p-2 hover:bg-zinc-800 rounded-md"
          onClick={() => setShowAddPost(true)}
        >
          <AddCircleOutlineIcon style={{ fontSize: 28, color: '#fff' }} />
        </div>
        <div
          className="flex items-center justify-center p-2 hover:bg-zinc-800 rounded-md relative"
          onClick={() => navigate('/messages')}
        >
          {isMessages ? (
            <SendIcon style={{ fontSize: 28, color: '#fff' }} />
          ) : (
            <SendOutlinedIcon style={{ fontSize: 28, color: '#fff' }} />
          )}
          {unreadCount > 0 && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full z-10"></div>
          )}
        </div>
        <div
          className="flex items-center justify-center p-2 hover:bg-zinc-800 rounded-md"
          onClick={handleProfile}
        >
          <img
            className="w-7 h-7 rounded-full object-cover"
            src={user?.ProfilePicture || ''}
            alt="profile image"
          />
        </div>
      </div>
      {/* Modals */}
      {showAddPost && <Dialogaddpost isopen={showAddPost} onClose={() => setShowAddPost(false)} />}
      {showSearch && (
        <SearchPanel ref={searchRef} searchResults={searchResults} onSearch={handleSearch} onClose={() => setShowSearch(false)} />
      )}
      {showNotifications && (
        <NotificationPanel ref={notificationRef} likeNotifications={likeNotifications} onClose={() => setShowNotifications(false)} />
      )}
      {showMore && (
        <MoreModal isOpen={showMore} onClose={() => setShowMore(false)} />
      )}
    </>
  );
};

export default LeftSide;