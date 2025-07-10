import React, { useState } from 'react'
import Dialogcomment from '../modals/dialogcomment';
import { useDispatch } from 'react-redux';
import { setSelectedPost } from "../../redux/postSlice.js";

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
                    <img className='h-[400px] object-cover' src={post?.image} alt="postimages" />
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
