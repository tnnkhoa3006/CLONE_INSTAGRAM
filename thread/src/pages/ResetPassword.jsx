import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/axios';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!password || !confirmPassword) {
            return toast.error('Please fill in both fields');
        }

        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }
        console.log(token);
        setLoading(true);
        try {
            const res = await api.post(`/user/resetpassword/${token}`, { password });
            toast.success(res.data.message || 'Password reset successfully');
            navigate('/login');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="bg-zinc-800 p-8 rounded-xl space-y-4 w-full max-w-sm">
                <h1 className="text-white text-xl font-bold">Reset Password</h1>
                <input
                    type="password"
                    placeholder="Enter new password"
                    className="bg-zinc-900 border border-zinc-700 p-2 rounded text-white w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Confirm new password"
                    className="bg-zinc-900 border border-zinc-700 p-2 rounded text-white w-full"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                    onClick={handleReset}
                    className="bg-blue-600 w-full py-2 rounded text-white hover:bg-blue-500 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
            </div>
        </div>
    );
};

export default ResetPassword;
