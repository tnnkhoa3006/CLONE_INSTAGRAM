import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import Thumbnail from '../assets/thumbnails.png'
import Instagramlogo from '../assets/instagramlogo.png'
import FacebookIcon from '@mui/icons-material/Facebook';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '../redux/authSlice.js';

const Login = () => {
  const navigate = useNavigate()
  const [imputText, setInputText] = useState({
    email: '',
    password: ''
  })
  const { user } = useSelector(store => store.auth);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleInput = (e) => {
    setInputText({ ...imputText, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();
      const res = await axios.post('/user/login', imputText, {
        header: {
          "Content-Type": "application/json"
        },
        withCredentials: true
      });

      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
        toast.success(res.data.message);
        setInputText({ email: '', password: '' });
        navigate('/');
      }
    } catch (error) {
      const message = error.response.data.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, []);
  return (
    <section className="w-screen h-screen">
      <div className="w-full h-4/5 flex">
        <article className="flex w-[970px] h-full m-auto pb-[55px] pt-[55px] justify-center items-center">
          <div className="w-[580px] h-full">
            <img className="w-[545px] h-[460px] mt-[20px]" src={Thumbnail} alt="thumbnails" />
          </div>
          <div className="w-[360px] h-full flex flex-col">
            <div className="w-full flex items-center flex-col justify-center pt-[20px]">
              <div className="w-[180px] pt-[30px] flex justify-center items-center">
                <img
                  title="Instagram"
                  src={Instagramlogo}
                  alt="Instagram"
                  className="w-full cursor-pointer"
                />
              </div>
              <div className="w-full flex justify-center items-center">
                <div className="w-full pt-[30px] flex flex-col justify-center items-center space-y-[20px]">
                  <form onSubmit={handleLogin} className='w-full' action="">
                    <div className="w-full flex justify-center items-center pb-[10px]">
                      <input
                        className="text-xs w-3/4 h-[35px] text-white outline-none resize-none bg-zinc-900 rounded-sm border-[1px] border-gray-500 px-3"
                        type="text"
                        placeholder="Phone number, username, or email"
                        name='email'
                        value={imputText.email}
                        onChange={handleInput}
                      />
                    </div>
                    <div className="w-full flex justify-center items-center">
                      <input
                        className="text-xs w-3/4 h-[35px] text-white outline-none resize-none bg-zinc-900 rounded-sm border-[1px] border-gray-500 px-3"
                        type="password"
                        placeholder="Password"
                        name='password'
                        value={imputText.password}
                        onChange={handleInput}
                      />
                    </div>
                    <div className="w-full flex justify-center items-center pt-[15px]">
                      <button
                        type='submit'
                        className="w-3/4 h-[30px] text-gray-300 bg-blue-700 rounded-lg border-[1px] border-gray-500"
                      >Log in
                      </button>
                    </div>
                    <div className="w-full flex justify-center items-center pt-[10px]">
                      <div className="flex w-3/4 pt-[10px] items-center justify-center">
                        <div className="w-2/5 h-[0.4px] bg-zinc-700"></div>
                        <div className="w-1/5 text-white text-[12px] flex justify-center items-center">OR</div>
                        <div className="w-2/5 h-[0.4px] bg-zinc-700"></div>
                      </div>
                    </div>
                    <div className="w-full flex justify-center items-center pt-[20px]">
                      <div className="w-3/4 flex justify-center items-center cursor-pointer">
                        <FacebookIcon style={{ fontSize: 25, color: 'blue' }} />
                        <span className="text-blue-500 text-[14px] font-semibold ml-[10px]">Log in with Facebook</span>
                      </div>
                    </div>
                    <div className="w-full flex justify-center items-center pt-[15px]">
                      <span className="text-white text-[14px] font-semibold cursor-pointer hover:underline">Forgot password?</span>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="w-full flex justify-center items-center pt-[55px] space-x-1">
              <span className="text-white text-[14px]">Don't have you account?</span>
              <span
                className="text-blue-400 text-[14px] font-semibold cursor-pointer hover:text-blue-300"
                onClick={() => navigate('/register')}
              >
                Sign up
              </span>
            </div>
          </div>
        </article>
      </div>
      <div className="text-white text-[20px] flex justify-center items-center w-full h-1/5 border-[1px]">Footer</div>
    </section>
  )
}

export default Login
