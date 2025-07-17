import React from 'react';
import { Dialog } from '@headlessui/react';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuthUser } from '../../redux/authSlice';
import { setPosts } from '../../redux/postSlice';
import api from '../../services/axios';

const MoreModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

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
    };
    const toggleDarkMode = () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    };
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
            <div className="fixed inset-0 flex items-end md:items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-sm rounded-xl bg-zinc-900 text-white shadow-xl">
                    <div className="divide-y divide-zinc-800">
                        <div className="p-3 space-y-2">
                            <MenuItem icon={<SettingsIcon />} label="Settings" />
                            <MenuItem icon={<HistoryIcon />} label="Your activity" />
                            <MenuItem icon={<BookmarkBorderIcon />} label="Saved" />
                            <MenuItem icon={<Brightness4Icon />} label="Switch appearance" />
                            <MenuItem icon={<ReportProblemOutlinedIcon />} label="Report a problem" />
                        </div>
                        <div onClick={toggleDarkMode} className="p-3">
                            <MenuItem icon={<SwitchAccountIcon />} label="Switch accounts" />
                        </div>
                        <div onClick={logoutHandler} className="p-3">
                            <MenuItem icon={<LogoutIcon />} label="Log out" />
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

const MenuItem = ({ icon, label }) => (
    <div className="flex items-center space-x-3 hover:bg-zinc-800 p-2 rounded-md cursor-pointer">
        <span className="text-white">{icon}</span>
        <span className="text-sm font-medium text-white">{label}</span>
    </div>
);

export default MoreModal;
