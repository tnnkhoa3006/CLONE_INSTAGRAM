import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/axios";
import toast from "react-hot-toast";
import Instagramlogo from "../assets/instagramlogo.png";
import Thumbnail from "../assets/thumbnails.png";
import FacebookIcon from "@mui/icons-material/Facebook";

const Register = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInput = (e) => {
    setInputText({ ...inputText, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = inputText;

    if (!username || !email || !password || !confirmPassword) {
      return toast.error("Please fill in all fields.");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    try {
      setLoading(true);
      const res = await api.post("/user/register", {
        username,
        email,
        password,
      });
      toast.success(res.data.message || "Registration successful");
      setInputText({ username: "", email: "", password: "", confirmPassword: "" });
      navigate("/login");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-screen min-h-screen bg-black flex flex-col">
      <div className="flex-grow flex items-center justify-center p-4">
        <article className="flex flex-col md:flex-row max-w-4xl w-full mx-auto items-center justify-center gap-6">
          {/* Thumbnail */}
          <div className="hidden md:flex md:w-1/2 justify-center">
            <img
              src={Thumbnail}
              alt="thumbnail"
              className="w-full max-w-[450px] h-auto"
            />
          </div>

          {/* Register Form */}
          <div className="w-full md:w-1/2 flex flex-col items-center px-4">
            <div className="w-full max-w-[350px] flex flex-col items-center">
              <div className="w-[180px] py-6 flex justify-center">
                <img src={Instagramlogo} alt="Instagram" className="w-full" />
              </div>

              <form onSubmit={handleRegister} className="w-full space-y-4">
                <button
                  type="button"
                  className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold text-sm hover:bg-blue-700"
                  disabled
                >
                  <FacebookIcon className="mr-2" />
                  Sign up with Facebook
                </button>

                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1/3 h-[1px] bg-gray-600"></div>
                  <span className="text-gray-400 text-sm">OR</span>
                  <div className="w-1/3 h-[1px] bg-gray-600"></div>
                </div>

                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={inputText.username}
                  onChange={handleInput}
                  disabled={loading}
                  className="w-full h-10 text-sm text-white bg-zinc-800 rounded border border-gray-600 px-3 placeholder-gray-400"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Phone number or email"
                  value={inputText.email}
                  onChange={handleInput}
                  disabled={loading}
                  className="w-full h-10 text-sm text-white bg-zinc-800 rounded border border-gray-600 px-3 placeholder-gray-400"
                />

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={inputText.password}
                  onChange={handleInput}
                  disabled={loading}
                  className="w-full h-10 text-sm text-white bg-zinc-800 rounded border border-gray-600 px-3 placeholder-gray-400"
                />

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={inputText.confirmPassword}
                  onChange={handleInput}
                  disabled={loading}
                  className="w-full h-10 text-sm text-white bg-zinc-800 rounded border border-gray-600 px-3 placeholder-gray-400"
                />

                <p className="text-xs text-gray-400 text-center">
                  People who use our service may have uploaded your contact info to Instagram.{" "}
                  <span className="text-blue-400 underline cursor-pointer">Learn more</span>
                </p>

                <p className="text-xs text-gray-400 text-center">
                  By signing up, you agree to our{" "}
                  <span className="text-blue-400 underline cursor-pointer">Terms</span>,{" "}
                  <span className="text-blue-400 underline cursor-pointer">Privacy Policy</span>, and{" "}
                  <span className="text-blue-400 underline cursor-pointer">Cookies Policy</span>.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-9 text-white bg-blue-600 rounded font-semibold text-sm hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {loading ? "Signing up..." : "Sign up"}
                </button>
              </form>

              <div className="w-full flex justify-center pt-6 text-sm">
                <span className="text-gray-300">Have an account?</span>
                <span
                  className="text-blue-400 font-semibold ml-1 cursor-pointer hover:text-blue-300"
                  onClick={() => navigate("/login")}
                >
                  Log in
                </span>
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
