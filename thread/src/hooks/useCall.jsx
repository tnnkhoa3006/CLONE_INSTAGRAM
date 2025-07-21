import { useRef, useState, useEffect, useCallback } from "react";
import { createSocket } from "../sockets/socket";
import api from '../services/axios';

export const useCall = (userId) => {
  const [callState, setCallState] = useState("idle"); // idle, calling, receiving, in-call
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
    // Announce this as a 'call' connection
    const s = createSocket(userId, 'call');
    setSocket(s);

    s.on("callMade", async (data) => {
      setCallState("receiving");
      setCallerInfo(data);
    });

    s.on("answerMade", async (data) => {
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        setCallState("in-call");
      }
    });

    s.on("iceCandidate", async (data) => {
      if (pcRef.current && data.candidate) await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
    });
    s.on("callEnded", () => {
      endCall(false);
    });

    s.on("callDeclined", () => {
      setCallState("declined");
    });

    return () => {
      s.disconnect()
      endCall(false)
    };
  }, [userId]);

  useEffect(() => {
    if (callState === 'in-call' && !callStartTimeRef.current) {
      callStartTimeRef.current = Date.now();
    }
  }, [callState]);

  const createPeerConnection = useCallback(async (targetId) => {
    if (!socket) return null;
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject"
        }
      ]
    });
    pcRef.current = peerConnection;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", {
          candidate: event.candidate,
          to: targetId,
          from: userId,
        });
      }
    };
    peerConnection.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideo.current) {
        localVideo.current.srcObject = stream;
      }
      stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
      return peerConnection;
    } catch (err) {
      console.error("Failed to get media permissions", err);
      setCallState('idle');
      return null;
    }
  }, [socket, userId]);

  const call = useCallback(async (targetUserId, callerDetails) => {
    if (!targetUserId || !socket) return;
    remotePeerIdRef.current = targetUserId;
    setCallState("calling");
    const peerConnection = await createPeerConnection(targetUserId);
    if (peerConnection) {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit("callUser", { offer, to: targetUserId, from: userId, caller: callerDetails });
    }
  }, [createPeerConnection, socket, userId]);

  const accept = useCallback(async (offer, from) => {
    if (!offer || !from || !socket) return;
    remotePeerIdRef.current = from;
    setCallState("in-call");
    const peerConnection = await createPeerConnection(from);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit("makeAnswer", { answer, to: from, from: userId });
      setCallState("in-call");
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
    if (localVideo.current && localVideo.current.srcObject) {
      localVideo.current.srcObject.getTracks().forEach(track => track.stop());
      localVideo.current.srcObject = null;
    }
    if (remoteVideo.current && remoteVideo.current.srcObject) {
      remoteVideo.current.srcObject.getTracks().forEach(track => track.stop());
      remoteVideo.current.srcObject = null;
    }
    if (notifyPeer && socket && remotePeerIdRef.current) {
      socket.emit('endCall', { to: remotePeerIdRef.current })
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
      localVideo.current.srcObject.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      });
    }
  };
  const toggleVideo = () => {
    if (localVideo.current?.srcObject) {
      localVideo.current.srcObject.getVideoTracks().forEach((track) => {
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
