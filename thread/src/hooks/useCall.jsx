import { useRef, useState, useEffect, useCallback } from "react";
import { createSocket } from "../sockets/socket";
import { getXirsysIceServers } from "../utils/iceConfig";
import api from '../services/axios';

export const useCall = (userId) => {
  const [callState, setCallState] = useState("idle"); // idle, calling, receiving, in-call, declined
  const [socket, setSocket] = useState(null);
  const pcRef = useRef(null);
  const remotePeerIdRef = useRef(null);
  const localVideo = useRef();
  const remoteVideo = useRef();
  const callStartTimeRef = useRef(null);
  const [callerInfo, setCallerInfo] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const s = createSocket(userId, "call");
    setSocket(s);

    s.on("callMade", async (data) => {
      setCallState("receiving");
      setCallerInfo(data);
    });

    s.on("answerMade", async (data) => {
      if (pcRef.current?.signalingState === "have-local-offer") {
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          setCallState("in-call");
        } catch (err) {
          console.error("❌ Failed to set remote answer:", err);
        }
      } else {
        console.warn("⚠️ Skipped setRemoteDescription(answer): wrong state", pcRef.current?.signalingState);
      }
    });

    s.on("iceCandidate", async (data) => {
      if (pcRef.current && data.candidate) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error("❌ Failed to add ICE candidate", err);
        }
      }
    });

    s.on("callEnded", () => {
      endCall(false);
    });

    s.on("callDeclined", () => {
      setCallState("declined");
    });

    return () => {
      s.disconnect();
      endCall(false);
    };
  }, [userId]);

  useEffect(() => {
    if (callState === 'in-call' && !callStartTimeRef.current) {
      callStartTimeRef.current = Date.now();
    }
  }, [callState]);

  const createPeerConnection = useCallback(async (targetId) => {
    const iceServers = await getXirsysIceServers();

    const pc = new RTCPeerConnection({
      iceServers,
      iceCandidatePoolSize: 10,
    });

    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("iceCandidate", {
          candidate: event.candidate,
          to: targetId,
          from: userId,
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
    };

    pc.onsignalingstatechange = () => {
      console.log("Signaling state:", pc.signalingState);
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideo.current) {
        localVideo.current.srcObject = stream;
      }

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      return pc;
    } catch (err) {
      console.error("🎙️ Failed to get user media", err);
      setCallState('idle');
      return null;
    }
  }, [socket, userId]);

  const call = useCallback(async (targetUserId, callerDetails) => {
    if (!targetUserId || !socket) return;
    remotePeerIdRef.current = targetUserId;
    setCallState("calling");

    const pc = await createPeerConnection(targetUserId);
    if (pc) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("callUser", {
        offer,
        to: targetUserId,
        from: userId,
        caller: callerDetails,
      });
    }
  }, [createPeerConnection, socket, userId]);

  const accept = useCallback(async (offer, from) => {
    if (!offer || !from || !socket) return;
    remotePeerIdRef.current = from;
    setCallState("in-call");

    const pc = await createPeerConnection(from);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("makeAnswer", {
        answer,
        to: from,
        from: userId,
      });
    }
  }, [createPeerConnection, socket, userId]);

  const endCall = (notifyPeer = true) => {
    if (notifyPeer && remotePeerIdRef.current && callStartTimeRef.current) {
      const durationMs = Date.now() - callStartTimeRef.current;
      const seconds = Math.floor((durationMs / 1000) % 60).toString().padStart(2, '0');
      const minutes = Math.floor((durationMs / (1000 * 60)) % 60).toString().padStart(2, '0');
      const hours = Math.floor((durationMs / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
      const durationStr = hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;

      api.post('/message/call-log', {
        receiverId: remotePeerIdRef.current,
        duration: `Call ended, duration: ${durationStr}`
      }).catch(err => console.error("Failed to log call", err));
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    [localVideo, remoteVideo].forEach(videoRef => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    });

    if (notifyPeer && socket && remotePeerIdRef.current) {
      socket.emit("endCall", { to: remotePeerIdRef.current });
    }

    setCallState("idle");
    setCallerInfo(null);
    setRemoteStream(null);
    setLocalStream(null);
    remotePeerIdRef.current = null;
    callStartTimeRef.current = null;
  };

  const toggleMicrophone = () => {
    if (localVideo.current?.srcObject) {
      localVideo.current.srcObject.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      });
    }
  };

  const toggleVideo = () => {
    if (localVideo.current?.srcObject) {
      localVideo.current.srcObject.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsVideoOff(!track.enabled);
      });
    }
  };

  return {
    callState,
    localVideo,
    remoteVideo,
    remoteStream,
    localStream,
    isMuted,
    isVideoOff,
    callerInfo,
    call,
    accept,
    endCall,
    toggleMicrophone,
    toggleVideo,
  };
};
