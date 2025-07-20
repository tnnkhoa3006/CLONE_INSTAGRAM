import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "../../redux/postSlice.js";
import EmojiPicker from "emoji-picker-react";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-hot-toast";
import api from "../../services/axios";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const Dialogaddpost = ({ isopen, onClose }) => {
    const [step, setStep] = useState(1);
    const [uploaded, setUploaded] = useState(false);
    const [inputText, setInputText] = useState("");
    const [imageUrl, setImageUrl] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [Edit, setEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { user } = useSelector((store) => store.auth);
    const { posts } = useSelector((store) => store.post);
    const dispatch = useDispatch();
    const [fileType, setFileType] = useState("");

    const createPostHandler = async (e) => {
        const formData = new FormData();
        formData.append("caption", inputText);
        formData.append("file", imageFile);
        try {
            setLoading(true);
            const res = await api.post("/post/addpost", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });
            if (res.data.success) {
                dispatch(setPosts([res.data.post, ...posts]));
                toast.success(res.data.message);
                onClose();
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
    };

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const MAX_SIZE = 100 * 1024 * 1024; // 100MB
            if (file.size > MAX_SIZE) {
                toast.error("File size exceeds 100MB. Please select a smaller file.");
                return;
            }
            const url = URL.createObjectURL(file);
            setImageUrl(url);
            setImageFile(file);
            setUploaded(true);
            setFileType(file.type.startsWith("video/") ? "video" : "image");
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
        } else {
            setUploaded(false);
            setImageUrl(null);
            setImageFile(null);
        }
    };

    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        if (isopen) {
            setIsFading(true);
        } else {
            setTimeout(() => setIsFading(false), 300); // Delay to match transition duration
        }
    }, [isopen]);

    if (!isopen && !isFading) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex justify-center items-center px-4 transition-opacity duration-300 ${isFading ? "opacity-100" : "opacity-0"
                }`}
            style={{ backgroundColor: isFading ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0)" }}
        >
            {!uploaded && (
                <div
                    className={`flex flex-col w-full max-w-[min(90vw,500px)] sm:max-w-[min(90vw,600px)] transition-all duration-300 ${isFading ? "scale-100 opacity-100" : "scale-95 opacity-0"
                        }`}
                >
                    <header className="flex justify-center items-center bg-black rounded-t-xl p-4 relative">
                        <div className="text-base font-semibold">Create new post</div>
                    </header>
                    <div className="w-full h-[50vh] max-h-[400px] sm:max-h-[500px] bg-zinc-800 rounded-b-xl flex flex-col justify-center items-center shadow overflow-hidden">
                        <div className="flex flex-col items-center px-4">
                            <InsertPhotoIcon className="text-5xl mb-2" />
                            <h2 className="text-lg font-medium mb-4 text-center">
                                Drag photos and videos here
                            </h2>
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleUpload}
                            accept="image/*,video/*"
                            disabled={loading}
                            id="file-upload"
                        />
                        <button
                            className={`px-4 py-2 rounded-md text-base ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                                } text-white`}
                            onClick={() => !loading && document.getElementById("file-upload").click()}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Select a file"}
                        </button>
                    </div>
                </div>
            )}

            {uploaded && (
                <div
                    className={`flex flex-col w-full max-w-[min(90vw,900px)] transition-all duration-300 ${isFading ? "scale-100 opacity-100" : "scale-95 opacity-0"
                        }`}
                >
                    <header className="flex items-center justify-between bg-black rounded-t-xl p-4 relative">
                        <KeyboardArrowLeftIcon
                            onClick={loading ? null : handlePrevStep}
                            className={`text-2xl ${loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                        />
                        <div className="text-base font-semibold absolute left-1/2 transform -translate-x-1/2">
                            {step === 1 ? "Crop" : step === 2 ? "Edit" : "Create new post"}
                        </div>
                        {step === 3 ? (
                            <div
                                className={`text-sm font-semibold ${loading
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-blue-500 hover:underline cursor-pointer"
                                    }`}
                                onClick={loading ? null : createPostHandler}
                            >
                                {loading ? "Sharing..." : "Share"}
                            </div>
                        ) : (
                            <div
                                className={`text-sm font-semibold ${loading
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-blue-500 hover:underline cursor-pointer"
                                    }`}
                                onClick={loading ? null : handleNextStep}
                            >
                                Next
                            </div>
                        )}
                    </header>

                    {step === 1 && (
                        <div
                            className={`w-full h-[50vh] max-h-[500px] sm:max-h-[600px] flex items-center justify-center bg-zinc-800 rounded-b-xl overflow-hidden transition-opacity duration-300 ${isFading ? "opacity-100" : "opacity-0"
                                }`}
                        >
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
                                    {fileType === "video" ? (
                                        <video
                                            src={imageUrl}
                                            controls
                                            className="w-full h-full object-contain aspect-auto"
                                        />
                                    ) : (
                                        <img
                                            src={imageUrl}
                                            alt="Uploaded"
                                            className="w-full h-full object-contain aspect-auto"
                                        />
                                    )}
                                </TransformComponent>
                            </TransformWrapper>
                        </div>
                    )}

                    {step === 2 && (
                        <div
                            className={`w-full h-[50vh] max-h-[600px] flex flex-col sm:flex-row bg-zinc-800 rounded-b-xl overflow-hidden transition-opacity duration-300 ${isFading ? "opacity-100" : "opacity-0"
                                }`}
                        >
                            <div className="w-full sm:w-[60%] h-[60%] sm:h-full flex items-center justify-center">
                                {fileType === "video" ? (
                                    <video src={imageUrl} className="w-full h-full object-contain aspect-auto" />
                                ) : (
                                    <img src={imageUrl} alt="Uploaded" className="w-full h-full object-contain aspect-auto" />
                                )}
                            </div>
                            <div className="w-full sm:w-[40%] h-[40%] sm:h-full flex flex-col overflow-y-auto bg-zinc-800 border-t sm:border-t-0 sm:border-l border-zinc-700">
                                <div className="flex">
                                    <button
                                        onClick={() => setEdit(true)}
                                        className="flex w-1/2 h-10 items-center justify-center border-b cursor-pointer focus:bg-zinc-700 focus:border-b-blue-500"
                                    >
                                        <span className="text-blue-500 text-sm font-semibold">Filters</span>
                                    </button>
                                    <button
                                        onClick={() => setEdit(false)}
                                        className="flex w-1/2 h-10 items-center justify-center border-b cursor-pointer focus:bg-zinc-700 focus:border-b-blue-500"
                                    >
                                        <span className="text-blue-500 text-sm font-semibold">Adjustments</span>
                                    </button>
                                </div>
                                <div className="flex flex-1 p-3">
                                    {Edit ? <div>Filters (Placeholder)</div> : <div>Adjustments (Placeholder)</div>}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div
                            className={`w-full h-[60vh] max-h-[600px] bg-zinc-800 rounded-b-xl overflow-hidden transition-opacity duration-300 flex flex-col sm:flex-row ${isFading ? "opacity-100" : "opacity-0"
                                }`}
                        >
                            {loading && (
                                <div className="absolute inset-0 bg-black bg-opacity-30 z-20 flex items-center justify-center">
                                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                            <div className="w-full sm:w-[60%] h-[50%] sm:h-full flex items-center justify-center">
                                {fileType === "video" ? (
                                    <video src={imageUrl} className="w-full h-full object-contain aspect-auto" />
                                ) : (
                                    <img src={imageUrl} alt="Uploaded" className="w-full h-full object-contain aspect-auto" />
                                )}
                            </div>
                            <div className="w-full sm:w-[40%] h-[50%] sm:h-full flex flex-col overflow-y-auto bg-zinc-800 sm:bg-transparent border-t sm:border-t-0 sm:border-l border-zinc-700 relative">
                                <div className="flex pt-4 pl-4 space-x-2 items-center">
                                    <img className="w-8 h-8 rounded-full object-cover" src={user.ProfilePicture} alt="profileimage" />
                                    <div className="text-sm font-semibold">{user.username}</div>
                                </div>
                                <div className="flex w-full h-full flex-col flex-1 p-3">
                                    <textarea
                                        className="w-full bg-zinc-800 text-sm font-medium outline-none resize-none h-full"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        maxLength={2200}
                                        disabled={loading}
                                        placeholder="Write a caption..."
                                    />
                                    <div className="flex mt-2 items-center">
                                        <button className="hidden md:block" onClick={() => setShowEmojiPicker((prev) => !prev)}>
                                            <EmojiEmotionsIcon className="hover:text-gray-400 text-lg" />
                                        </button>
                                        <div className="ml-auto text-xs text-gray-400">{inputText.length}/2,200</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {showEmojiPicker && (
                        <div className="absolute bottom-10 right-2 z-50 shadow-lg max-w-[80vw] sm:max-w-[280px]">
                            <EmojiPicker
                                onEmojiClick={handleEmojiClick}
                                theme="dark"
                                height={350}
                                width="100%"
                            />
                        </div>
                    )}
                </div>
            )}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 z-50 transition-all duration-200"
            >
                <CloseIcon className="text-xl" />
            </button>
        </div>
    );
};

export default Dialogaddpost;