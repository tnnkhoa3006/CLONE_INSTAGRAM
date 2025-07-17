import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Thumbnail from '../assets/thumbnails.png';
import Instagramlogo from '../assets/instagramlogo.png';
import FacebookIcon from '@mui/icons-material/Facebook';
import api from '../services/axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const Register = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState({
    username: '',
    email: '',
    password: '',
  });
  const { user } = useSelector((store) => store.auth);
  const [loading, setLoading] = useState(false);

  const handleInput = (e) => {
    setInputText({ ...inputText, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/user/register', inputText, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setInputText({ username: '', email: '', password: '' });
        navigate('/login');
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Registration failed');
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
          {/* Thumbnail - Hidden on mobile, shown on larger screens */}
          <div className="hidden md:flex md:w-1/2 justify-center">
            <img
              className="w-full max-w-[450px] h-auto"
              src={Thumbnail}
              alt="thumbnails"
            />
          </div>
          {/* Register Form */}
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
              <div className="w-full flex flex-col items-center space-y-4">
                <form onSubmit={handleSignup} className="w-full space-y-4">
                  <div className="w-full flex justify-center">
                    <h4 className="w-full max-w-[300px] text-center text-gray-300 text-sm">
                      Sign up to see photos and videos from your friends.
                    </h4>
                  </div>
                  <div className="w-full flex justify-center">
                    <div className="w-full max-w-[300px] bg-blue-600 h-10 rounded flex justify-center items-center cursor-pointer hover:bg-blue-700">
                      <FacebookIcon style={{ fontSize: 20, color: 'white' }} />
                      <span className="text-white text-sm font-semibold ml-2">
                        Sign up with Facebook
                      </span>
                    </div>
                  </div>
                  <div className="flex w-full max-w-[300px] items-center justify-center space-x-2">
                    <div className="w-1/3 h-[1px] bg-gray-600"></div>
                    <span className="text-gray-400 text-sm">OR</span>
                    <div className="w-1/3 h-[1px] bg-gray-600"></div>
                  </div>
                  <div className="w-full flex justify-center">
                    <input
                      className="w-full max-w-[300px] h-10 text-sm text-white outline-none bg-zinc-800 rounded border border-gray-600 px-3 placeholder-gray-400 focus:border-blue-500"
                      type="text"
                      placeholder="Username"
                      name="username"
                      value={inputText.username}
                      onChange={handleInput}
                      disabled={loading}
                    />
                  </div>
                  <div className="w-full flex justify-center">
                    <input
                      className="w-full max-w-[300px] h-10 text-sm text-white outline-none bg-zinc-800 rounded border border-gray-600 px-3 placeholder-gray-400 focus:border-blue-500"
                      type="email"
                      placeholder="Phone number or email"
                      name="email"
                      value={inputText.email}
                      onChange={handleInput}
                      disabled={loading}
                    />
                  </div>
                  <div className="w-full flex justify-center">
                    <input
                      className="w-full max-w-[300px] h-10 text-sm text-white outline-none bg-zinc-800 rounded border border-gray-600 px-3 placeholder-gray-400 focus:border-blue-500"
                      type="password"
                      placeholder="Password"
                      name="password"
                      value={inputText.password}
                      onChange={handleInput}
                      disabled={loading}
                    />
                  </div>
                  <div className="w-full flex flex-col items-center space-y-3 text-gray-400 text-xs text-center">
                    <span className="max-w-[300px]">
                      People who use our service may have uploaded your contact information to Instagram.{' '}
                      <span className="text-blue-400 cursor-pointer hover:text-blue-300">Learn more</span>
                    </span>
                    <span className="max-w-[300px]">
                      By signing up, you agree to our{' '}
                      <span className="text-blue-400 cursor-pointer hover:text-blue-300">Terms</span>,{' '}
                      <span className="text-blue-400 cursor-pointer hover:text-blue-300">Privacy Policy</span>{' '}
                      and{' '}
                      <span className="text-blue-400 cursor-pointer hover:text-blue-300">Cookies Policy</span>.
                    </span>
                  </div>
                  <div className="w-full flex justify-center">
                    <button
                      type="submit"
                      className="w-full max-w-[300px] h-9 text-white bg-blue-600 rounded font-semibold text-sm hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      {loading ? 'Signing up...' : 'Sign up'}
                    </button>
                  </div>
                </form>
                <div className="w-full flex justify-center pt-6 text-sm">
                  <span className="text-gray-300">Have an account?</span>
                  <span
                    className="text-blue-400 font-semibold ml-1 cursor-pointer hover:text-blue-300"
                    onClick={() => navigate('/login')}
                  >
                    Log in
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
      <footer className="text-gray-400 text-sm flex justify-center items-center py-4 border-t border-gray-700">
        © 2025 Instagram Clone
      </footer>
    </section>
  );
};

export default Register;