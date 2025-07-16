import React, { useState } from 'react'
import Dialogcomment from '../modals/dialogcomment';
import { useDispatch } from 'react-redux';
import { setSelectedPost } from "../../redux/postSlice.js";

function getVideoThumbnail(mediaUrl) {
  if (!mediaUrl) return "";
  return mediaUrl.replace(/\.mp4$/, '.jpg').replace('/upload/', '/upload/so_0/');
}

const PostSticker = ({ posts }) => {
    const [showComment, setShowComment] = useState(false);
    const dispatch = useDispatch();
    const handleOpenComment = (post) => {
        dispatch(setSelectedPost(post));
        setShowComment(true);
    };

    return (
        <div className='flex flex-wrap w-full'>
            {posts?.map((post) => (
                <div
                    key={post._id}
                    onClick={() => handleOpenComment(post)}
                    className='flex basis-1/3 items-center cursor-pointer pr-1 pb-1'
                >
                    {post.mediaType === "video" ? (
                        <img
                            className='h-[400px] object-cover'
                            src={getVideoThumbnail(post?.mediaUrl)}
                            alt="video thumbnail"
                        />
                    ) : (
                        <img
                            className='h-[400px] object-cover'
                            src={post?.mediaUrl}
                            alt="post"
                        />
                    )}
                </div>
            ))}
            <Dialogcomment
                isopen={showComment}
                onClose={() => setShowComment(false)}
            />
        </div>
    )
}

export default PostSticker
