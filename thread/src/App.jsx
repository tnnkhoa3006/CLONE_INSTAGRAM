import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Splashpage from './pages/Splashpage';
import ResetPassword from './pages/ResetPassword';
import ReelsPage from './pages/ReelsPage';
import CallVideoPage from './pages/CallVideoPage';
import './App.css';
import { Toaster } from 'react-hot-toast';
import MainLayout from './pages/mainLayout';
import EditProfile from './pages/EditProfile';
import ChatMessage from './pages/ChatMessage';
import ProtectRoutes from './utils/ProtectRoutes';
import { useSelector, useDispatch } from 'react-redux';
import useListenPostLike from './hooks/useListenPostLike';
import useSocket from './hooks/useSocket';
import useListenComment from './hooks/useListenComment';
import useListenPostDelete from './hooks/useListenPostDelete';
import useGetRTM from './hooks/useGetRTM';
import useGetAllMessage from './hooks/useGetAllMessage';
import useGetAllPost from './hooks/useGetAllPost';
import DialogCall from './components/modals/dialogCall';
import { clearIncomingCall } from './redux/callSlice';

function AppContent() {
  const { loading: postLoading } = useSelector(store => store.post);
  const { user } = useSelector(store => store.auth);
  const { incomingCall } = useSelector(store => store.call);
  const { socket } = useSelector(store => store.socketio);
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();
  const dispatch = useDispatch();

  // Gọi các custom hook ở đây
  useGetAllPost();
  useGetAllMessage();
  useGetRTM();
  useSocket(user);
  useListenPostLike();
  useListenComment();
  useListenPostDelete();

  const handleAcceptCall = () => {
    if (!incomingCall || !incomingCall.caller) return;
    const { from, offer, caller } = incomingCall;

    const url = `/call?isReceiving=true&from=${from}&username=${caller.username}&avatar=${caller.avatar}&offer=${encodeURIComponent(JSON.stringify(offer))}`;
    window.open(url, '_blank', 'width=800,height=600');
    dispatch(clearIncomingCall());
  }

  const handleDeclineCall = () => {
    if (incomingCall && socket) {
      socket.emit("declineCall", {
        to: incomingCall.from,
        from: user._id
      });
    }
    dispatch(clearIncomingCall());
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (postLoading) {
      setShowSplash(true); // Hiện splash khi loading
    } else {
      const timer = setTimeout(() => {
        setShowSplash(false); // Ẩn splash sau 2s khi load xong
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [postLoading]);

  useEffect(() => {
    const handleCallEnded = (event) => {
      if (event.data && event.data.type === 'CALL_ENDED') {
        window.location.reload();
      }
    };
    window.addEventListener('message', handleCallEnded);
    return () => window.removeEventListener('message', handleCallEnded);
  }, []);


  // Check if the current route is /login or /register
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      {incomingCall && incomingCall.caller && (
        <DialogCall
            isOpen={true}
            onAccept={handleAcceptCall}
            onDecline={handleDeclineCall}
            callerName={incomingCall.caller.username}
            callerAvatar={incomingCall.caller.avatar}
        />
      )}
      <div className="min-h-screen text-black dark:bg-black dark:text-white transition-all">
        {showSplash && !isAuthRoute ? (
          <Splashpage />
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/resetpassword/:token" element={<ResetPassword />} />
            <Route path="/call" element={<CallVideoPage />} />
            <Route element={<ProtectRoutes><MainLayout /></ProtectRoutes>}>
              <Route path="/" element={<Home />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/messages" element={<ChatMessage />} />
              <Route path="/reels" element={<ReelsPage />} />
            </Route>
          </Routes>
        )}
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;