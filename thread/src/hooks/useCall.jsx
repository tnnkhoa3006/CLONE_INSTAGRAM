import { useRef, useState, useEffect, useCallback } from "react";
import { createSocket } from "../sockets/socket";
import api from "../services/axios";

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

    const s = createSocket(userId, "call");
    setSocket(s);

    s.on("callMade", (data) => {
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
      if (pcRef.current && data.candidate) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
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
    if (callState === "in-call" && !callStartTimeRef.current) {
      callStartTimeRef.current = Date.now();
    }
  }, [callState]);

  const createPeerConnection = useCallback(async (targetId) => {
    if (!socket) return null;

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        // Free STUN servers
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
        // Your existing TURN servers
        {
          urls: "turn:jp.relay.metered.ca:80",
          username: "0922412337f8bab8aa7e9a18",
          credential: "xO82R/RQLy4k6CPO",
        },
        {
          urls: "turn:jp.relay.metered.ca:443",
          username: "0922412337f8bab8aa7e9a18",
          credential: "xO82R/RQLy4k6CPO",
        },
        {
          urls: "turn:jp.relay.metered.ca:443?transport=tcp",
          username: "0922412337f8bab8aa7e9a18",
          credential: "xO82R/RQLy4k6CPO",
        },
      ],
      iceCandidatePoolSize: 10,
    });

    // Add ICE connection monitoring
    peerConnection.oniceconnectionstatechange = () => {
      console.log("ICE Connection State:", peerConnection.iceConnectionState);
    };

    peerConnection.onicegatheringstatechange = () => {
      console.log("ICE Gathering State:", peerConnection.iceGatheringState);
    };

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
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = event.streams[0];
      }
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
      console.error("Media permission error:", err);
      setCallState("idle");
      return null;
    }
  }, [socket, userId]);

  const call = useCallback(
    async (targetUserId, callerDetails) => {
      if (!targetUserId || !socket) return;
      remotePeerIdRef.current = targetUserId;
      setCallState("calling");

      const peerConnection = await createPeerConnection(targetUserId);
      if (peerConnection) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit("callUser", { offer, to: targetUserId, from: userId, caller: callerDetails });
      }
    },
    [createPeerConnection, socket, userId]
  );

  const accept = useCallback(
    async (offer, from) => {
      if (!offer || !from || !socket) return;
      remotePeerIdRef.current = from;
      setCallState("in-call");

      const peerConnection = await createPeerConnection(from);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit("makeAnswer", { answer, to: from, from: userId });
      }
    },
    [createPeerConnection, socket, userId]
  );

  const endCall = (notifyPeer = true) => {
    if (notifyPeer && remotePeerIdRef.current && callStartTimeRef.current) {
      const durationMs = Date.now() - callStartTimeRef.current;
      const seconds = Math.floor((durationMs / 1000) % 60).toString().padStart(2, "0");
      const minutes = Math.floor((durationMs / (1000 * 60)) % 60).toString().padStart(2, "0");
      const hours = Math.floor((durationMs / (1000 * 60 * 60)) % 24).toString().padStart(2, "0");
      const durationStr = hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;

      api.post("/message/call-log", {
        receiverId: remotePeerIdRef.current,
        duration: `Call ended, duration: ${durationStr}`,
      }).catch(console.error);
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    [localVideo, remoteVideo].forEach((vidRef) => {
      if (vidRef.current && vidRef.current.srcObject) {
        vidRef.current.srcObject.getTracks().forEach((track) => track.stop());
        vidRef.current.srcObject = null;
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
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      });
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
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
