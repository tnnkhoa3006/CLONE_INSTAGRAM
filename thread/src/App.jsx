import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import './App.css'
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import MainLayout from './pages/mainLayout';
import EditProfile from './pages/EditProfile'
import ChatMessage from './pages/ChatMessage'
import ProtectRoutes from './utils/ProtectRoutes'
import { useSelector } from 'react-redux'
import useListenPostLike from './hooks/useListenPostLike'
import useSocket from './hooks/useSocket'
import useListenComment from './hooks/useListenComment'
import useListenPostDelete from './hooks/useListenPostDelete'
import useGetRTM from './hooks/useGetRTM'
import useGetAllMessage from './hooks/useGetAllMessage'

// Sử dụng domain backend mới
axios.defaults.baseURL =
  process.env.NODE_ENV === 'production'
    ? "https://clone-instagram-117m.onrender.com/api/v1"
    : "http://localhost:5000/api/v1";

console.log(axios.defaults.baseURL);

function App() {
  const { user } = useSelector(store => store.auth);

  useGetAllMessage();
  useGetRTM();
  useSocket(user);           // Quản lý socket, notification, online users
  useListenPostLike();       // Lắng nghe cập nhật like real-time
  useListenComment();       // Lắng nghe cập nhật comment real-time
  useListenPostDelete(); // Lắng nghe cập nhật post delete real-time

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectRoutes><MainLayout /></ProtectRoutes>}>
            <Route path="/" element={<Home />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/messages" element={<ChatMessage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
