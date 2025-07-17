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

    // Hiệu ứng fade khi mở/đóng dialog
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        if (isopen) {
            setIsFading(true);
        } else {
            setIsFading(false);
        }
    }, [isopen]);

    if (!isopen && !isFading) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-center px-2 sm:px-4 transition-opacity duration-300 ${isFading ? "opacity-100" : "opacity-0"
                }`}
            style={{ backgroundColor: isFading ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0)" }}
        >
            {!uploaded && (
                <div
                    className={`flex flex-col w-full max-w-[90vw] sm:max-w-[500px] md:max-w-[600px] mx-auto transition-all duration-300 ${isFading ? "scale-100 opacity-100" : "scale-95 opacity-0"
                        }`}
                >
                    <header className="flex justify-center items-center bg-black rounded-t-xl sm:rounded-t-3xl p-3 sm:p-4 relative">
                        <div className="text-sm sm:text-base font-semibold">Create new post</div>
                    </header>
                    <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] bg-zinc-800 rounded-b-xl sm:rounded-b-3xl flex flex-col justify-center items-center shadow overflow-hidden">
                        <div className="flex flex-col items-center px-4">
                            <InsertPhotoIcon className="text-4xl sm:text-5xl md:text-6xl mb-2" />
                            <h2 className="text-base sm:text-lg md:text-xl font-medium mb-2 text-center">
                                Drag photos and videos here
                            </h2>
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleUpload}
                            accept="image/*,video/*"
                            disabled={loading}
                        />
                        <button
                            className={`px-4 py-2 rounded-md mt-4 text-sm sm:text-base ${loading
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600"
                                } text-white`}
                            onClick={() => !loading && document.querySelector('input[type="file"]').click()}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Select a file"}
                        </button>
                    </div>
                </div>
            )}

            {uploaded && (
                <div
                    className={`flex flex-col w-full max-w-[90vw] sm:max-w-[600px] md:max-w-[850px] lg:max-w-[900px] mx-auto transition-all duration-300 ${isFading ? "scale-100 opacity-100" : "scale-95 opacity-0"
                        }`}
                >
                    <header className="flex items-center justify-between bg-black rounded-t-xl sm:rounded-t-3xl p-3 sm:p-4 relative">
                        <KeyboardArrowLeftIcon
                            onClick={loading ? null : handlePrevStep}
                            className={`text-xl sm:text-2xl md:text-3xl ${loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                                }`}
                        />
                        <div className="text-sm sm:text-base font-semibold absolute left-1/2 transform -translate-x-1/2">
                            {step === 1 ? "Crop" : step === 2 ? "Edit" : "Create new post"}
                        </div>
                        {step === 3 ? (
                            <div
                                className={`text-xs sm:text-sm font-semibold ${loading
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-blue-500 hover:underline cursor-pointer"
                                    }`}
                                onClick={loading ? null : createPostHandler}
                            >
                                {loading ? "Sharing..." : "Share"}
                            </div>
                        ) : (
                            <div
                                className={`text-xs sm:text-sm font-semibold ${loading
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
                            className={`flex flex-col w-full max-w-[90vw] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] xl:max-w-[900px] mx-auto transition-all duration-300 ${isFading ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
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
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <img
                                            src={imageUrl}
                                            alt="Uploaded"
                                            className="w-full h-full object-contain"
                                        />
                                    )}
                                </TransformComponent>
                            </TransformWrapper>
                        </div>
                    )}

                    {step === 2 && (
                        <div
                            className={`w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px] flex flex-col sm:flex-row bg-zinc-800 rounded-b-xl sm:rounded-b-3xl overflow-hidden transition-opacity duration-300 ${isFading ? "opacity-100" : "opacity-0"}`}
                        >
                            <div className="w-full sm:w-[60%] h-full flex items-center justify-center">
                                {fileType === "video" ? (
                                    <video src={imageUrl} className="w-full h-full object-contain" />
                                ) : (
                                    <img src={imageUrl} alt="Uploaded" className="w-full h-full object-contain" />
                                )}
                            </div>
                            <div className="w-full sm:w-[40%] h-full flex flex-col overflow-y-auto bg-zinc-800 border-t sm:border-t-0 sm:border-l border-zinc-700">
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
                                    {Edit ? <div>text</div> : <div>caption</div>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3 */}
                    {step === 3 && (
                        <div
                            className={`w-full h-[450px] sm:h-[500px] md:h-[550px] lg:h-[600px] bg-zinc-800 rounded-b-xl sm:rounded-b-3xl overflow-hidden transition-opacity duration-300 flex sm:flex-row flex-col ${isFading ? "opacity-100" : "opacity-0"}`}
                        >
                            {/* Overlay nếu loading */}
                            {loading && (
                                <div className="absolute inset-0 bg-black bg-opacity-30 z-20 cursor-not-allowed" style={{ pointerEvents: "all" }} />
                            )}

                            {/* Media hiển thị */}
                            <div className="w-full sm:w-[60%] h-[250px] sm:h-full flex items-center justify-center">
                                {fileType === "video" ? (
                                    <video src={imageUrl} className="w-full h-full object-contain" />
                                ) : (
                                    <img src={imageUrl} alt="Uploaded" className="w-full h-full object-contain" />
                                )}
                            </div>

                            {/* Caption nhập liệu */}
                            <div className="w-full sm:w-[40%] h-[200px] sm:h-full flex flex-col overflow-y-auto bg-zinc-800 sm:bg-transparent border-t sm:border-t-0 sm:border-l border-zinc-700 relative">
                                {/* User */}
                                <div className="flex pt-4 pl-4 space-x-2 items-center">
                                    <img className="w-8 h-8 rounded-full object-cover" src={user.ProfilePicture} alt="profileimage" />
                                    <div className="text-sm font-semibold">{user.username}</div>
                                </div>

                                {/* Caption */}
                                <div className="flex w-full flex-col flex-1 p-3">
                                    <textarea
                                        className="w-full bg-zinc-800 text-sm font-medium outline-none resize-none"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        maxLength={2200}
                                        disabled={loading}
                                        placeholder="Write a caption..."
                                    />
                                    <div className="flex pt-2 items-center">
                                        <button onClick={() => setShowEmojiPicker((prev) => !prev)}>
                                            <EmojiEmotionsIcon className="hover:text-gray-400 text-lg" />
                                        </button>
                                        <div className="ml-auto text-xs text-gray-400">{inputText.length}/2,200</div>
                                    </div>

                                    {/* Emoji Picker */}
                                    {showEmojiPicker && (
                                        <div className="absolute bottom-10 right-2 z-50 shadow-lg">
                                            <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" height={250} width={280} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1 sm:p-2 z-50 transition-all duration-200"
            >
                <CloseIcon className="text-lg sm:text-xl md:text-2xl" />
            </button>
        </div>
    );
};

export default Dialogaddpost;