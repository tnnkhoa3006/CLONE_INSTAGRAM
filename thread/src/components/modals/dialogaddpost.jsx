import React from 'react'
import { useState } from 'react'
import EmojiPicker from "emoji-picker-react";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-hot-toast';
import api from '../../services/axios';

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '../../redux/postSlice.js';

const Dialogaddpost = ({ isopen, onClose }) => {
    const [step, setStep] = useState(1);
    const [uploaded, setUploaded] = useState(false);
    const [inputText, setInputText] = useState("");
    const [imageUrl, setImageUrl] = useState(null);
    const [imageFile, setImageFile] = useState(null); // Thêm state để lưu file gốc
    const [Edit, setEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { user } = useSelector(store => store.auth)
    const { posts } = useSelector(store => store.post)
    const dispatch = useDispatch();

    const createPostHandler = async (e) => {
        const formData = new FormData();
        formData.append("caption", inputText);
        formData.append("image", imageFile); // Gửi file gốc thay vì URL
        try {
            setLoading(true);
            const res = await api.post("/post/addpost", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            })
            if (res.data.success) {
                dispatch(setPosts([res.data.post, ...posts]));
                toast.success(res.data.message);
                onClose();
                // Reset states
                setStep(1);
                setUploaded(false);
                setInputText("");
                setImageUrl(null);
                setImageFile(null);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    }

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log("Uploaded file:", file.name);
            const url = URL.createObjectURL(file);
            setImageUrl(url); // URL để hiển thị
            setImageFile(file); // File gốc để gửi lên server
            setUploaded(true);
        }
    };

    const handleEmojiClick = (emojiData) => {
        setInputText((prev) => prev + emojiData.emoji);
    };

    const handleNextStep = () => {
        if (step < 3) {
            setStep(step + 1);
        }
    };

    const handlePrevStep = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    if (!isopen) return null
    return (
        <div className='fixed inset-0 z-50 flex bg-black bg-opacity-60 justify-center items-center'>
            {!uploaded && (
                <div className="flex flex-col">
                    <header className="flex justify-center items-center bg-black rounded-t-3xl p-2">
                        <div className="text-base font-semibold">Create new post</div>
                    </header>
                    <div className="w-[500px] h-[500px] bg-zinc-800 rounded-b-3xl flex flex-col justify-center items-center shadow">
                        <div className="flex flex-col items-center">
                            <InsertPhotoIcon style={{ fontSize: 80 }} />
                            <h2 className="text-xl font-medium mb-2">Drag photos and videos here</h2>
                        </div>
                        <input type="file" className='hidden' onChange={handleUpload} accept="image/*" disabled={loading} />
                        <button
                            className={`px-4 py-2 rounded-md mt-4 ${loading
                                    ? 'bg-gray-500 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600'
                                } text-white`}
                            onClick={() => !loading && document.querySelector('input[type="file"]').click()}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Select a file'}
                        </button>
                    </div>
                </div>
            )}

            {uploaded && (
                <div className='fixed inset-0 z-50 flex justify-center items-center'>
                    <div className="flex flex-col">
                        <header className='flex items-center justify-center bg-black rounded-t-3xl p-2'>
                            <KeyboardArrowLeftIcon
                                onClick={loading ? null : (() => {
                                    if (step === 1) {
                                        setUploaded(false);
                                        setImageUrl(null);
                                        setImageFile(null);
                                    } else {
                                        handlePrevStep();
                                    }
                                })}
                                style={{
                                    fontSize: 30,
                                    marginRight: 'auto',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.5 : 1
                                }}
                            />
                            <div className="text-base font-semibold">
                                {step === 1 ? 'Crop' : step === 2 ? 'Edit' : 'Create new post'}
                            </div>
                            {step === 3 ? (
                                <div
                                    className={`text-sm my-auto ml-auto font-semibold cursor-pointer ${loading
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-blue-500 hover:underline'
                                        }`}
                                    onClick={loading ? null : createPostHandler}>
                                    {loading ? 'Sharing...' : 'Share'}
                                </div>
                            ) : (
                                <div
                                    className={`text-sm my-auto ml-auto font-semibold ${loading
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-blue-500 hover:underline cursor-pointer'
                                        }`}
                                    onClick={loading ? null : handleNextStep}>
                                    Next
                                </div>
                            )
                            }
                        </header>
                        {step === 1 && (
                            <div className="w-[500px] h-[500px] bg-zinc-800 rounded-b-3xl relative overflow-hidden">
                                <TransformWrapper
                                    zoomAnimation={{ disabled: true }}
                                    doubleClick={{ disabled: true }}
                                    wheel={{ disabled: true }}
                                    pinch={{ disabled: true }}
                                    pan={{ disabled: false }}
                                    panning={{ velocityDisabled: true }}
                                    minScale={1}
                                    maxScale={1}
                                    initialScale={1}
                                >
                                    <TransformComponent wrapperClass="w-full h-full flex items-center justify-center">
                                        <img
                                            src={imageUrl}
                                            alt="Uploaded"
                                            className="w-full h-full object-cover"
                                        />
                                    </TransformComponent>
                                </TransformWrapper>
                            </div>
                        )}
                        {step === 2 && <div className="w-[850px] h-[500px] flex bg-zinc-800 rounded-b-3xl m-auto">
                            <div className="w-[500px] h-full flex items-center justify-center">
                                <img
                                    src={imageUrl}
                                    alt="Uploaded"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="w-[350px] flex flex-col">
                                <div className="flex">
                                    <button
                                        onClick={() => setEdit(true)}
                                        className="flex w-1/2 h-[40px] items-center justify-center border-b cursor-pointer focus:bg-zinc-700 focus:border-b-blue-500"
                                    >
                                        <span className="text-blue-500 focus:text-blue-500 text-[14px] font-semibold">Filters</span>
                                    </button>
                                    <button
                                        onClick={() => setEdit(false)}
                                        className="flex w-1/2 h-[40px] items-center justify-center border-b cursor-pointer focus:bg-zinc-700 focus:border-b-blue-500"
                                    >
                                        <span className="text-blue-500 text-[14px] font-semibold">Adjustmments</span>
                                    </button>
                                </div>
                                <div className="flex">
                                    {Edit ?
                                        (
                                            <div>text</div>
                                        )
                                        :
                                        (
                                            <div>caption</div>
                                        )
                                    }
                                </div>
                            </div>
                        </div>}
                        {step === 3 && <div className="flex w-[850px] h-[500px] bg-zinc-800 rounded-b-3xl">
                            <div className="w-[500px] h-full flex">
                                <img
                                    src={imageUrl}
                                    alt="Uploaded"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="w-[350px] flex flex-col border-[1px]">
                                <div className="flex pt-[20px] pl-[20px] space-x-2 items-center">
                                    <div className="flex justify-center">
                                        <img className='w-[30px] h-[30px] rounded-full' src={user.ProfilePicture} alt="profileimage" />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="text-[14px] font-semibold">{user.username}</div>
                                    </div>
                                </div>
                                <div className="flex w-full flex-col">
                                    <div className='flex w-full h-[150px] pt-[10px] pl-[20px]'>
                                        <textarea className='w-[330px] bg-zinc-800 text-[14px] font-semibold outline-none resize-none' type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} maxLength={2200} />
                                    </div>
                                    <div className='flex w-[330px] pt-[10px] pl-[20px] items-center'>
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowEmojiPicker(prev => !prev)}
                                                className="text-sm font-semibold"
                                            >
                                                <EmojiEmotionsIcon titleAccess="Emoji" className="hover:text-gray-400" style={{ fontSize: 20, cursor: 'pointer' }} />
                                            </button>

                                            {showEmojiPicker && (
                                                <div className="absolute bottom-[40px] right-0 z-50 shadow-lg">
                                                    <EmojiPicker
                                                        onEmojiClick={handleEmojiClick}
                                                        theme="dark"
                                                        height={350}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex ml-auto text-[12px] text-gray-400">
                                            {inputText.length}/2.200
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>}
                    </div>
                </div>
            )}
            <button
                onClick={onClose}
                className="absolute top-4 right-8 text-zinc-300 hover:text-white"
                style={{ zIndex: 100 }}
            >
                <CloseIcon style={{ fontSize: 32 }} />
            </button>
        </div>
    )
}

export default Dialogaddpost