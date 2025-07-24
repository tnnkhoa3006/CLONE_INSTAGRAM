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
    if (callState === 'in-call' && !callStartTimeRef.current) {
      callStartTimeRef.current = Date.now();
    }
  }, [callState]);

  // ✅ Handle remote stream changes
  useEffect(() => {
    if (remoteStream && remoteVideo.current) {
      remoteVideo.current.srcObject = remoteStream;
      remoteVideo.current.play().catch(e => console.log('Auto-play prevented:', e));
    }
  }, [remoteStream]);

  const createPeerConnection = useCallback(async (targetId) => {
    if (!socket) return null;

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        // ✅ Updated working TURN servers từ search
        {
          urls: [
            "turn:openrelay.metered.ca:80",
            "turn:openrelay.metered.ca:80?transport=tcp",
            "turn:openrelay.metered.ca:443",
            "turn:openrelay.metered.ca:443?transport=tcp"
          ],
          username: "openrelayproject",
          credential: "openrelayproject"
        },
        // ✅ ExpressTURN working credentials
        {
          urls: [
            "turn:relay1.expressturn.com:3478",
            "turn:relay1.expressturn.com:3478?transport=tcp"
          ],
          username: "ef6TE7LD2XB8BA5BF5",
          credential: "FhGUhPgR2rr5cSb0"
        },
        // ✅ Twilio fallback
        {
          urls: "turn:global.turn.twilio.com:3478?transport=udp",
          username: "dc2d2894d5b7576bd7b35b52ad60fea5b24f70696d9c2b0c42cabb0d209b4735",
          credential: "tE2DajzSJwnsSbc123"
        }
      ],
      iceCandidatePoolSize: 10,
      iceTransportPolicy: 'all' // Trở lại all để test
    });

    pcRef.current = peerConnection;

    // ✅ DEBUG: Check connection type and state
    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE state:', peerConnection.iceConnectionState);

      // Check if using TURN relay
      peerConnection.getStats().then(stats => {
        stats.forEach(stat => {
          if (stat.type === 'candidate-pair' && stat.state === 'succeeded') {
            console.log('Connection type:', stat.localCandidate?.type, '->', stat.remoteCandidate?.type);
          }
        });
      });
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🔄 ICE candidate:', event.candidate.type, event.candidate.address);
        socket.emit("iceCandidate", {
          candidate: event.candidate,
          to: targetId,
          from: userId,
        });
      } else {
        console.log('✅ ICE gathering complete');
      }
    };

    // ✅ CRITICAL: Enhanced remote track handling for TURN
    peerConnection.ontrack = (event) => {
      console.log('🎵 Received remote track:', event.track.kind, 'enabled:', event.track.enabled);

      const [remoteStream] = event.streams;

      // ✅ Force enable tracks (sometimes disabled over TURN)
      event.track.enabled = true;

      setRemoteStream(remoteStream);

      if (remoteVideo.current) {
        remoteVideo.current.srcObject = remoteStream;
        remoteVideo.current.play().catch(e => console.log('Auto-play prevented:', e));
      }
    };

    try {
      // ✅ Enhanced media constraints for TURN compatibility
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          frameRate: { ideal: 30, max: 30 },
          facingMode: "user"
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      });

      console.log('📹 Local tracks:', stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
      setLocalStream(stream);

      if (localVideo.current) {
        localVideo.current.srcObject = stream;
      }

      // ✅ IMPORTANT: Use addTransceiver for better TURN compatibility
      stream.getTracks().forEach((track) => {
        const transceiver = peerConnection.addTransceiver(track, {
          direction: 'sendrecv',
          streams: [stream]
        });
        console.log('➕ Added transceiver:', track.kind, transceiver.direction);
      });

      return peerConnection;
    } catch (err) {
      console.error("❌ Failed to get media permissions", err);
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
      // ✅ Wait a bit for tracks to be fully added
      await new Promise(resolve => setTimeout(resolve, 100));

      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await peerConnection.setLocalDescription(offer);

      console.log('📞 Sending offer with tracks:', offer.sdp.includes('m=audio'), offer.sdp.includes('m=video'));

      socket.emit("callUser", {
        offer,
        to: targetUserId,
        from: userId,
        caller: callerDetails
      });
    }
  }, [createPeerConnection, socket, userId]);

  const accept = useCallback(async (offer, from) => {
    if (!offer || !from || !socket) return;

    console.log('📥 Received offer with tracks:', offer.sdp.includes('m=audio'), offer.sdp.includes('m=video'));

    remotePeerIdRef.current = from;
    setCallState("in-call");

    const peerConnection = await createPeerConnection(from);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await peerConnection.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await peerConnection.setLocalDescription(answer);

      console.log('📤 Sending answer with tracks:', answer.sdp.includes('m=audio'), answer.sdp.includes('m=video'));

      socket.emit("makeAnswer", { answer, to: from, from: userId });
    }
  }, [createPeerConnection, socket, userId]);

  const endCall = useCallback((notifyPeer = true) => {
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

    // ✅ Clean up local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (localVideo.current && localVideo.current.srcObject) {
      localVideo.current.srcObject = null;
    }

    // ✅ Clean up remote stream
    if (remoteVideo.current && remoteVideo.current.srcObject) {
      remoteVideo.current.srcObject = null;
    }

    if (notifyPeer && socket && remotePeerIdRef.current) {
      socket.emit('endCall', { to: remotePeerIdRef.current });
    }

    setCallState("idle");
    setCallerInfo(null);
    setRemoteStream(null);
    setLocalStream(null);
    remotePeerIdRef.current = null;
    callStartTimeRef.current = null;
    setIsMuted(false);
    setIsVideoOff(false);
  }, [localStream, socket]);

  const toggleMicrophone = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      });
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsVideoOff(!track.enabled);
      });
    }
  }, [localStream]);

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