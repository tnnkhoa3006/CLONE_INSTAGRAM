import React, { useState } from "react";
import Dialogcomment from "../modals/dialogcomment";
import { useDispatch } from "react-redux";
import { setSelectedPost } from "../../redux/postSlice.js";

function getVideoThumbnail(mediaUrl) {
  if (!mediaUrl) return "";
  return mediaUrl.replace(/\.mp4$/, ".jpg").replace("/upload/", "/upload/so_0/");
}

const PostSticker = ({ posts }) => {
  const [showComment, setShowComment] = useState(false);
  const dispatch = useDispatch();

  const handleOpenComment = (post) => {
    dispatch(setSelectedPost(post));
    setShowComment(true);
  };

  return (
    <div className="flex flex-wrap w-full">
      {posts?.filter(Boolean).map((post) => (
        <div
          key={post._id}
          onClick={() => handleOpenComment(post)}
          className="flex basis-1/3 items-center cursor-pointer p-0.5 md:p-1"
        >
          {post.mediaType === "video" ? (
            <img
              className="w-full h-[150px] md:h-[400px] object-cover rounded"
              src={getVideoThumbnail(post?.mediaUrl)}
              alt="video thumbnail"
              onError={(e) => (e.target.src = "/default-thumbnail.jpg")} // Fallback nếu thumbnail lỗi
            />
          ) : (
            <img
              className="w-full h-[150px] md:h-[400px] object-cover rounded"
              src={post?.mediaUrl}
              alt="post"
              onError={(e) => (e.target.src = "/default-image.jpg")} // Fallback nếu ảnh lỗi
            />
          )}
        </div>
      ))}
      <Dialogcomment isopen={showComment} onClose={() => setShowComment(false)} />
    </div>
  );
};

export default PostSticker;