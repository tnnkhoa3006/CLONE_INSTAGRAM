// components/ChangePasswordModal.jsx
import React, { useState } from "react";
import api from "../../services/axios.js";
import toast from "react-hot-toast";

const ChangePasswordModal = ({ onClose }) => {
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        const { oldPassword, newPassword, confirmPassword } = passwordData;

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            const res = await api.post("/user/changepassword", {
                oldPassword,
                newPassword,
            });

            toast.success(res.data.message || "Password changed");
            onClose(); // Đóng modal
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
            <div className="bg-zinc-900 rounded-2xl p-6 w-[90%] max-w-md space-y-4 border border-zinc-700">
                <h1 className="text-xl font-bold text-white">Change Password</h1>

                <input
                    type="password"
                    placeholder="Old password"
                    value={passwordData.oldPassword}
                    onChange={(e) =>
                        setPasswordData({ ...passwordData, oldPassword: e.target.value })
                    }
                    className="w-full bg-zinc-800 p-3 rounded-lg border border-zinc-600 text-white"
                />
                <input
                    type="password"
                    placeholder="New password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className="w-full bg-zinc-800 p-3 rounded-lg border border-zinc-600 text-white"
                />
                <input
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                        setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                        })
                    }
                    className="w-full bg-zinc-800 p-3 rounded-lg border border-zinc-600 text-white"
                />

                <div className="flex justify-end gap-4 pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleChangePassword}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-500 rounded-lg text-white"
                    >
                        {loading ? "Processing..." : "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
