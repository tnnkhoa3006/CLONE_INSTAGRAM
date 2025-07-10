import React from 'react'
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setPosts, setSelectedPost } from '../../redux/postSlice.js';

const Dialogmore_option = ({ isOpen, onClose, post }) => {
    const { user } = useSelector(store => store.auth);
    const { posts, selectedPost } = useSelector(store => store.post);
    const dispatch = useDispatch();

    if (!isOpen) return null;

    // Sử dụng post từ prop hoặc selectedPost từ Redux store
    const currentPost = post || selectedPost;

    const deletePostHandler = async () => {
        try {
            const res = await axios.delete(`/post/delete/${currentPost._id}`, { withCredentials: true });
            if (res.data.success) {
                const updatedPosts = posts.filter(p => p._id !== currentPost._id);
                dispatch(setPosts(updatedPosts));

                // Nếu đang xóa selectedPost, clear nó
                if (selectedPost && selectedPost._id === currentPost._id) {
                    dispatch(setSelectedPost(null));
                }

                toast.success(res.data.message);
                onClose();
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-neutral-800 text-white rounded-2xl w-[400px]">
                {user && user._id === currentPost?.author?._id &&
                    <div>
                        <button onClick={deletePostHandler} className="w-full text-sm font-medium text-red-500 border-b-[1px] border-zinc-700 py-3">Delete</button>
                    </div>
                }
                <div>
                    <button className="w-full text-sm font-medium text-red-500 border-b-[1px] border-zinc-700 py-3">Report</button>
                </div>
                <div>
                    {user && user._id !== currentPost?.author?._id &&
                        <button className="w-full text-sm font-medium text-red-500 border-b-[1px] border-zinc-700 py-3">Unfollow</button>
                    }
                </div>
                {[
                    "Add to favorites", "Go to post", "Share to ...", "Copy link", "Embed", "About this account"
                ].map((label, index) => (
                    <div className='w-full border-b-[1px] border-zinc-700 py-3' key={index}>
                        <button className="w-full text-sm font-medium text-center">{label}</button>
                    </div>
                ))}
                <div>
                    <button onClick={onClose} className="w-full text-sm font-medium text-center py-3">Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default Dialogmore_option
