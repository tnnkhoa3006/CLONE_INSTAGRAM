import React, { useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useCall } from '../hooks/useCall';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ZoomOutMapOutlinedIcon from '@mui/icons-material/ZoomOutMapOutlined';
import MicOutlinedIcon from '@mui/icons-material/MicOutlined';
import MicOffIcon from '@mui/icons-material/MicOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';

const CallVideoPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user: currentUser } = useSelector((state) => state.auth);

    const query = new URLSearchParams(location.search);
    const targetUserId = query.get('targetUserId');
    const isReceiving = query.get('isReceiving') === 'true';

    const {
        localVideo,
        remoteVideo,
        remoteStream,
        localStream,
        endCall,
        toggleMicrophone,
        isMuted,
        toggleVideo,
        isVideoOff,
        call,
        accept,
        callState,
    } = useCall(currentUser?._id);

    const prevCallStateRef = useRef(callState);
    useEffect(() => {
        prevCallStateRef.current = callState;
    });
    const prevCallState = prevCallStateRef.current;

    useEffect(() => {
        if (!currentUser?._id) return;

        if (isReceiving) {
            const offerStr = query.get('offer');
            if (offerStr) {
                const offer = JSON.parse(decodeURIComponent(offerStr));
                const from = query.get('from');
                accept(offer, from);
            }
        } else if (targetUserId) {
            call(targetUserId, { username: currentUser.username, avatar: currentUser.ProfilePicture });
        }
    }, [currentUser, isReceiving, targetUserId, call, accept]);

    useEffect(() => {
        if (remoteVideo.current && remoteStream) {
            remoteVideo.current.srcObject = remoteStream;
        }
    }, [remoteStream, remoteVideo]);
    
    useEffect(() => {
        if (localVideo.current && localStream) {
            localVideo.current.srcObject = localStream;
        }
    }, [localStream, localVideo]);

    useEffect(() => {
        // Khi kết thúc cuộc gọi, đóng popup và reload trang chính
        const wasCallActive = prevCallState === 'in-call' || prevCallState === 'calling';
        if (wasCallActive && callState === 'idle') {
            // Gửi tín hiệu về tab chính để reload
            if (window.opener) {
                window.opener.postMessage({ type: 'CALL_ENDED' }, '*');
            }
            window.close();
        }
    }, [callState, prevCallState]);


    const handleEndCall = () => {
        endCall();
        // The useEffect above will handle closing the window automatically.
    };

    const remoteUserInfo = {
        username: query.get('username'),
        avatar: query.get('avatar'),
    }

    return (
        <div className='fixed inset-0 bg-black z-50'>
            <div className='flex flex-col h-full'>
                <div className='flex justify-center items-center h-full z-10 relative'>
                    <video
                        ref={remoteVideo}
                        autoPlay
                        playsInline
                        muted={false}
                        className='w-full h-full object-cover'
                        style={{ background: "#222", display: remoteStream ? 'block' : 'none' }}
                    />
                    {!remoteStream && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                            <img src={remoteUserInfo.avatar} alt={remoteUserInfo.username} className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mb-4 object-cover" />
                            <p className="text-white text-lg sm:text-xl">{callState === 'calling' ? 'Calling...' : 'Connecting...'}</p>
                        </div>
                    )}
                </div>

                {/* Header */}
                <div className='absolute top-0 w-full flex items-center justify-between p-4 sm:p-6 z-30'>
                    <div className='text-white flex items-center gap-3'>
                        <div>
                            <img className='w-10 h-10 rounded-full object-cover' src={remoteUserInfo.avatar} alt="Guest" />
                        </div>
                        <div>
                            <h2 className='text-md font-semibold'>{remoteUserInfo.username}</h2>
                            <p className='text-sm font-light'>Video call</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-4 text-white'>
                        <SettingsOutlinedIcon style={{ fontSize: "26px", cursor: "pointer" }} />
                        <ZoomOutMapOutlinedIcon style={{ fontSize: "26px", cursor: "pointer" }} />
                    </div>
                </div>

                {/* Footer */}
                <footer className='absolute bottom-0 w-full p-4 sm:p-6 z-30'>
                    <div className='flex justify-center items-center text-white'>
                        <div className='flex gap-6 sm:gap-8 items-center'>
                            <button
                                className='rounded-full p-3 bg-white/20 backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors'
                                onClick={toggleVideo}
                            >
                                {isVideoOff ? (
                                    <VideocamOffIcon style={{ fontSize: "26px", color: "#EF4444" }} />
                                ) : (
                                    <VideocamRoundedIcon style={{ fontSize: "26px" }} />
                                )}
                            </button>
                            <button
                                className='rounded-full p-3 bg-white/20 backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors'
                                onClick={toggleMicrophone}
                            >
                                {isMuted ? (
                                    <MicOffIcon style={{ fontSize: "26px", color: "#EF4444" }} />
                                ) : (
                                    <MicOutlinedIcon style={{ fontSize: "26px" }} />
                                )}
                            </button>
                            <button
                                className='rounded-full p-4 bg-red-500 cursor-pointer hover:bg-red-600 transition-colors'
                                onClick={handleEndCall}
                            >
                                <CallEndIcon style={{ fontSize: "28px" }} />
                            </button>
                        </div>
                    </div>
                </footer>

                {/* Local video (small corner) */}
                <div className='absolute w-24 h-36 sm:w-32 md:w-48 bottom-24 sm:bottom-28 right-4 z-40'>
                    <video
                        ref={localVideo}
                        autoPlay
                        playsInline
                        muted
                        className='w-full h-full rounded-lg object-cover shadow-lg'
                        style={{ background: "#222" }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CallVideoPage;
