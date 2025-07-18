// components/ModalForgotPassword.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/axios';

const ModalForgotPassword = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email) return toast.error("Please enter your email");

        try {
            setLoading(true);
            const res = await api.post('/user/forgotpassword', { email });
            toast.success(res.data.message || "Reset link sent to email");
            onClose();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Error sending email");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
            <div className="bg-zinc-900 p-6 rounded-lg max-w-md w-full border border-zinc-700">
                <h2 className="text-white text-lg font-bold mb-4">Forgot Password</h2>
                <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full p-2 mb-4 bg-zinc-800 border border-zinc-600 rounded text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                />
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="text-sm text-white px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="text-sm text-white px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send Link"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalForgotPassword;
