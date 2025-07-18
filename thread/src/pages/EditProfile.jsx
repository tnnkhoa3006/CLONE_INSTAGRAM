import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/axios';
import toast from 'react-hot-toast';
import { setAuthUser } from '../redux/authSlice.js';
import ChangePasswordModal from '../components/modals/ChangePasswordModal.jsx';

const EditProfile = () => {
  const imageRef = useRef();
  const { user } = useSelector(store => store.auth);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [input, setInput] = useState({
    profilePhoto: user?.ProfilePicture,
    bio: user?.bio,
    gender: user?.gender,
  });
  const [previewImage, setPreviewImage] = useState(user?.ProfilePicture);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput({ ...input, profilePhoto: file });
      setPreviewImage(URL.createObjectURL(file)); // ✅ Cho phép xem trước ảnh mới
    }
  };

  const selectChangeHandler = (e) =>
    setInput({ ...input, gender: e.target.value });

  const editProfileHandler = async () => {
    const formData = new FormData();
    if (input.profilePhoto) formData.append("profilePhoto", input.profilePhoto);
    formData.append("bio", input.bio);
    formData.append("gender", input.gender);

    try {
      setLoading(true);
      const res = await api.post(`/user/profile/edit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      if (res.data.success) {
        const updatedUserData = {
          ...user,
          ProfilePicture: res.data.user.ProfilePicture,
          bio: res.data.user.bio,
          gender: res.data.user.gender,
        };
        dispatch(setAuthUser(updatedUserData));
        toast.success(res.data.message);
        navigate(`/profile/${user?._id}`);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white flex h-full min-h-screen bg-black px-4 pt-20 py-8">
      <div className="flex w-full max-w-3xl mx-auto justify-center">
        <div className="w-full space-y-6">
          <h1 className="font-bold text-xl">Edit profile</h1>

          {/* Profile section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-zinc-800 rounded-2xl p-4">
            <Link to={`/profile/${user?._id}`}>
              <img
                className="w-[60px] h-[60px] object-cover rounded-full"
                src={previewImage}
                alt="profile"
              />
            </Link>
            <div className="flex-1">
              <Link to={`/profile/${user?._id}`}>
                <span className="text-white text-sm font-semibold block">{user?.username}</span>
              </Link>
              <span className="text-gray-400 text-xs">@realChad🗿</span>
            </div>
            <input
              onChange={fileChangeHandler}
              ref={imageRef}
              type="file"
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => imageRef?.current.click()}
              className="text-white h-8 text-sm font-semibold bg-blue-700 hover:bg-blue-500 rounded-lg px-4"
            >
              Change photo
            </button>
          </div>

          {/* Bio */}
          <div className="flex flex-col space-y-2">
            <h1 className="font-bold text-lg">Bio</h1>
            <textarea
              value={input.bio}
              onChange={(e) => setInput({ ...input, bio: e.target.value })}
              className="w-full bg-zinc-900 rounded-2xl p-4 border border-zinc-700"
              rows={4}
            />
          </div>

          {/* Gender */}
          <div className="flex flex-col space-y-2">
            <h1 className="font-bold text-lg">Gender</h1>
            <select
              value={input.gender}
              onChange={selectChangeHandler}
              name="gender"
              className="w-full bg-zinc-900 rounded-2xl p-4 border border-zinc-700"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex">
            <div className="flex mr-auto">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="text-white h-10 text-sm font-semibold bg-red-700 hover:bg-red-500 rounded-lg px-6"
              >
                Change Password
              </button>
            </div>

            {/* Submit */}
            <div className="flex flex-end">
              <button
                onClick={editProfileHandler}
                disabled={loading}
                className={`text-white h-10 text-sm font-semibold bg-blue-700 hover:bg-blue-500 rounded-lg px-10 ${loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
              >
                {loading ? "Loading..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
};

export default EditProfile;
