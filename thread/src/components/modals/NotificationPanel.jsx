import React, { forwardRef } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const NotificationPanel = forwardRef(({ likeNotifications, onClose }, ref) => (
  <div
    ref={ref}
    className="fixed top-0 left-0 md:left-[80px] h-full w-full md:w-[350px] bg-black z-50 overflow-y-auto animate-slideInPanel"
    style={{ minHeight: "100vh" }}
  >
    {/* Header với nút back */}
    <div className="flex items-center p-4 font-bold text-lg text-white border-b border-zinc-700">
      {/* Nút back (chỉ mobile) */}
      <button
        className="md:hidden mr-4"
        onClick={() => {
          if (onClose) onClose(); // <-- đây là hành động "back"
        }}
      >
        <ArrowBackIcon style={{ color: "#fff" }} />
      </button>
      Notifications
    </div>

    {/* Danh sách thông báo */}
    {likeNotifications && likeNotifications.length > 0 ? (
      likeNotifications.map((notif, idx) => (
        <div
          key={idx}
          className="flex items-center px-4 py-3 hover:bg-zinc-800 transition"
        >
          <img
            src={notif.userDetails?.ProfilePicture}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
          <div className="flex-1 text-sm">
            <span className="font-semibold text-white">
              {notif.userDetails?.username}
            </span>
            <span className="text-gray-300 ml-1">liked your post.</span>
          </div>
        </div>
      ))
    ) : (
      <div className="p-4 text-gray-400 text-center">No notifications</div>
    )}
  </div>
));

export default NotificationPanel;
