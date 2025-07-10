import React, { forwardRef } from "react";

const NotificationPanel = forwardRef(({ likeNotifications }, ref) => (
  <div
    ref={ref}
    className="fixed left-[80px] top-0 h-full w-[350px] bg-black rounded-none z-50 overflow-y-auto animate-slideInPanel"
    style={{ minHeight: "100vh" }}
  >
    <div className="p-4 font-bold text-lg text-white">Notifications</div>
    {likeNotifications && likeNotifications.length > 0 ? (
      likeNotifications.map((notif, idx) => (
        <div key={idx} className="flex items-center px-4 py-3 hover:bg-zinc-800 transition">
          <img
            src={notif.userDetails?.ProfilePicture}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
          <div className="flex-1">
            <span className="font-semibold text-white">{notif.userDetails?.username}</span>
            <span className="text-gray-300 ml-2">liked your post.</span>
          </div>
        </div>
      ))
    ) : (
      <div className="p-4 text-gray-400 text-center">No notifications</div>
    )}
  </div>
));

export default NotificationPanel;
