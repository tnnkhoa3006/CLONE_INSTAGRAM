import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Message = ({ selectedUser }) => {
  const { messages } = useSelector((store) => store.chat);
  const { user } = useSelector((store) => store.auth);
  const bottomRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const Skeleton = () => (
    <div className="flex flex-col items-center py-8 px-4 space-y-3 animate-pulse">
      <div className="w-20 h-20 bg-zinc-700 rounded-full" />
      <div className="h-6 w-32 bg-zinc-700 rounded" />
      <div className="h-4 w-16 bg-zinc-700 rounded" />
      <div className="h-8 w-24 bg-zinc-700 rounded-xl" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-0">
      {/* User Info Section (Scrollable) */}
      {loading ? (
        <Skeleton />
      ) : (
        <div className="flex flex-col items-center py-8 px-4 space-y-3">
          <img
            className="w-20 h-20 object-cover rounded-full"
            src={selectedUser?.ProfilePicture}
            alt={selectedUser?.username}
          />
          <div className="flex flex-col items-center">
            <div className="font-semibold text-xl">{selectedUser?.username}</div>
            <div className="text-sm text-zinc-400">Instagram</div>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-zinc-700 px-3 py-1 hover:bg-zinc-600 transition-colors">
            <Link to={`/profile/${selectedUser?._id}`}>
              <button className="text-sm">View profile</button>
            </Link>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="px-4 space-y-2 pb-4">
        {loading ? (
          Array(5)
            .fill(0)
            .map((_, idx) => (
              <div key={idx} className="flex mb-2">
                <div className="mx-2 px-8 py-3 rounded-xl bg-zinc-700 animate-pulse" />
              </div>
            ))
        ) : (
          messages
            ?.filter(Boolean)
            .map((msg, idx) => (
              <div
                key={msg._id}
                className={`flex ${msg.senderId === user._id ? "justify-end" : "justify-start"} mb-2`}
              >
                <div
                  className={`mx-2 px-4 py-2 rounded-xl transition-all duration-300 opacity-0 animate-fadeIn ${msg.senderId === user._id ? "bg-blue-700" : "bg-zinc-600"
                    }`}
                  style={{ animationDelay: `${idx * 60}ms`, animationFillMode: "forwards" }}
                >
                  {msg.message}
                </div>
              </div>
            ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Message;