import { useRef } from "react";
import PostCard from "../post.component/postCard.jsx";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CenterSide = () => {
  const scrollRef = useRef(null);
  const { posts } = useSelector((store) => store.post);
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  // Danh sách stories: chính mình + những người đang follow
  const stories = user
    ? [user, ...(user.following || [])].filter((storyUser) => {
        return storyUser && storyUser._id && storyUser.username;
      })
    : [];

  let isDown = false;
  let startX;
  let scrollLeft;

  const handleMouseDown = (e) => {
    isDown = true;
    scrollRef.current?.classList.add("active");
    startX = e.pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeft = scrollRef.current?.scrollLeft || 0;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
  };

  const handleMouseMove = (e) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    isDown = false;
    scrollRef.current?.classList.remove("active");
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);
  };

  const handleTouchMove = (e) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const x = touch.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    isDown = false;
    scrollRef.current?.classList.remove("active");
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);
  };

  return (
    <div className="w-full flex flex-col pt-14 items-center px-2 md:px-0 md:pt-2">
      {/* Header section: Stories */}
      <div
        className="overflow-x-auto w-full max-w-2xl mt-2 md:mt-4 pl-1 md:pl-6"
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        style={{ cursor: "grab", userSelect: "none", WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex items-center w-max space-x-2 md:space-x-4 py-1 md:py-2 min-h-[80px]">
          {stories.length > 0 ? (
            stories.map((storyUser) => (
              <div
                key={storyUser._id}
                className="flex flex-col items-center w-[60px] md:w-[85px] cursor-pointer"
                onClick={() => navigate(`/profile/${storyUser._id}`)}
              >
                <div className="w-[60px] md:w-[85px] h-[60px] md:h-[85px] rounded-full overflow-hidden border-4 border-r-pink-500 border-b-purple-400 border-l-yellow-400 border-t-orange-400">
                  <img
                    src={storyUser.ProfilePicture || "/default-avatar.png"}
                    alt={`avatar-${storyUser.username}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                </div>
                <div className="text-white text-xs md:text-sm w-full text-center truncate mt-1">
                  {storyUser.username}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-sm pl-1">No stories available</div>
          )}
        </div>
      </div>
      {/* Post section */}
      <div className="flex flex-col items-center gap-2 md:gap-4 mt-2 md:mt-4 w-full max-w-2xl pr-2 md:pr-10">
        {posts?.filter(Boolean).map((post) => (
          <PostCard key={post._id} postId={post._id} />
        ))}
      </div>
    </div>
  );
};

export default CenterSide;