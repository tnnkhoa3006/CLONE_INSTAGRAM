import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Thumbnail from '../assets/thumbnails.png';
import Instagramlogo from '../assets/instagramlogo.png';
import FacebookIcon from '@mui/icons-material/Facebook';
import api from '../services/axios';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '../redux/authSlice.js';
import ModalForgotPassword from '../components/modals/ModalForgotPassword.jsx';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [inputText, setInputText] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);

  const handleInput = (e) => {
    setInputText({ ...inputText, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!inputText.email || !inputText.password) {
      toast.error("Please fill in both fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/user/login', inputText, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      if (res.data.success) {
        // Token sẽ được tự động lưu vào cookie từ response
        dispatch(setAuthUser(res.data.user));
        toast.success(res.data.message);
        setInputText({ email: '', password: '' });
        
        // Đảm bảo token được set trước khi chuyển trang
        setTimeout(() => {
          navigate('/');
        }, 100);
      } else {
        toast.error(res.data.message || "Login failed");
      }
    } catch (error) {
      const message = error?.response?.data?.message || "An unexpected error occurred";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <section className="w-screen min-h-screen bg-black flex flex-col">
      <div className="flex-grow flex items-center justify-center p-4">
        <article className="flex flex-col md:flex-row max-w-4xl w-full mx-auto items-center justify-center">
          {/* Thumbnail */}
          <div className="hidden md:flex md:w-1/2 justify-center">
            <img
              className="w-full max-w-[450px] h-auto"
              src={Thumbnail}
              alt="thumbnails"
            />
          </div>

          {/* Login Form */}
          <div className="w-full md:w-1/2 flex flex-col items-center px-4">
            <div className="w-full max-w-[350px] flex flex-col items-center">
              <div className="w-[180px] py-6 flex justify-center">
                <img
                  title="Instagram"
                  src={Instagramlogo}
                  alt="Instagram"
                  className="w-full cursor-pointer"
                />
              </div>

              <form onSubmit={handleLogin} className="w-full space-y-4">
                <div className="w-full flex justify-center">
                  <input
                    className="w-full max-w-[300px] h-10 text-sm text-white outline-none bg-zinc-800 rounded border border-gray-600 px-3 placeholder-gray-400"
                    type="text"
                    placeholder="Phone number, username, or email"
                    name="email"
                    value={inputText.email}
                    onChange={handleInput}
                    disabled={loading}
                  />
                </div>
                <div className="w-full flex justify-center">
                  <input
                    className="w-full max-w-[300px] h-10 text-sm text-white outline-none bg-zinc-800 rounded border border-gray-600 px-3 placeholder-gray-400"
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={inputText.password}
                    onChange={handleInput}
                    disabled={loading}
                  />
                </div>
                <div className="w-full flex justify-center">
                  <button
                    type="submit"
                    className="w-full max-w-[300px] h-9 text-white bg-blue-600 rounded font-semibold text-sm hover:bg-blue-700 disabled:bg-blue-400"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Log in'}
                  </button>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1/3 h-[1px] bg-gray-600"></div>
                  <span className="text-gray-400 text-sm">OR</span>
                  <div className="w-1/3 h-[1px] bg-gray-600"></div>
                </div>
                <div className="w-full flex justify-center">
                  <div className="flex items-center cursor-pointer">
                    <FacebookIcon style={{ fontSize: 20, color: '#1877F2' }} />
                    <span className="text-blue-500 text-sm font-semibold ml-2">
                      Log in with Facebook
                    </span>
                  </div>
                </div>
                <div className="w-full flex justify-center">
                  <span
                    onClick={() => setShowForgotModal(true)}
                    className="text-gray-300 text-sm cursor-pointer hover:underline"
                  >
                    Forgot password?
                  </span>
                </div>
              </form>

              <div className="w-full flex justify-center pt-6 text-sm">
                <span className="text-gray-300">Don't have an account?</span>
                <span
                  className="text-blue-400 font-semibold ml-1 cursor-pointer hover:text-blue-300"
                  onClick={() => navigate('/register')}
                >
                  Sign up
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>
      <footer className="text-gray-400 text-sm flex justify-center items-center py-4 border-t border-gray-700">
        © 2025 Instagram Clone
      </footer>
      <ModalForgotPassword
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </section>
  );
};

export default Login;
