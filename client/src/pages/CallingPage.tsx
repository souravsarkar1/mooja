import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Peer from 'simple-peer';
import { socket } from '@/lib/socket';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Maximize2, Minimize2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

export default function CallingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();
    const state = location.state || {};
    const { caller, incoming, signal: incomingSignal } = state;

    const [callAccepted, setCallAccepted] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const myVideo = useRef<HTMLVideoElement>(null);
    const userVideo = useRef<HTMLVideoElement>(null);
    const connectionRef = useRef<Peer.Instance | null>(null);
    const callHandled = useRef(false);

    // Explicitly handle stream attachment
    useEffect(() => {
        if (remoteStream && userVideo.current) {
            console.log("📺 Attaching remote stream to video element");
            userVideo.current.srcObject = remoteStream;

            // Re-attempt play if it doesn't start automatically
            const playVideo = async () => {
                try {
                    await userVideo.current?.play();
                    console.log("✅ Remote video playing");
                } catch (err) {
                    console.error("❌ Remote video play failed:", err);
                }
            };
            playVideo();
        }
    }, [remoteStream]);

    useEffect(() => {
        if (!caller || callHandled.current) return;
        callHandled.current = true;

        const startCalling = async () => {
            try {
                console.log("🎙️ Requesting local media...");
                const localStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                setStream(localStream);
                if (myVideo.current) myVideo.current.srcObject = localStream;

                const targetId = (caller.id || caller._id).toString();
                const iceConfig = {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                    ]
                };

                if (incoming && incomingSignal) {
                    console.log("📥 Answering call. Signaling...");
                    const peer = new Peer({
                        initiator: false,
                        trickle: false,
                        stream: localStream,
                        config: iceConfig
                    });

                    peer.on('signal', (data) => {
                        console.log("📡 Emitting answer signal to:", targetId);
                        socket.emit('answer-call', { signal: data, to: targetId });
                    });

                    peer.on('stream', (rStream) => {
                        console.log("🌊 Received remote stream (Answerer)");
                        setRemoteStream(rStream);
                        setCallAccepted(true);
                    });

                    peer.on('error', (err) => console.error("❌ Peer Error:", err));
                    peer.on('connect', () => console.log("🤝 P2P Connected"));

                    peer.signal(incomingSignal);
                    connectionRef.current = peer;

                } else {
                    console.log("📤 Initiating call to:", targetId);
                    const peer = new Peer({
                        initiator: true,
                        trickle: false,
                        stream: localStream,
                        config: iceConfig
                    });

                    peer.on('signal', (data) => {
                        console.log("📡 Emitting offer signal to:", targetId);
                        socket.emit('call-user', {
                            userToCall: targetId,
                            signalData: data,
                            from: user?.id,
                            name: user?.username,
                            avatar: user?.avatar
                        });
                    });

                    peer.on('stream', (rStream) => {
                        console.log("🌊 Received remote stream (Initiator)");
                        setRemoteStream(rStream);
                        setCallAccepted(true);
                    });

                    peer.on('error', (err) => console.error("❌ Peer Error:", err));
                    peer.on('connect', () => console.log("🤝 P2P Connected"));

                    socket.on('call-accepted', (signal) => {
                        console.log("🤝 Call accepted! Signaling back...");
                        setCallAccepted(true); // Show video container early
                        peer.signal(signal);
                    });

                    connectionRef.current = peer;
                }

            } catch (err) {
                console.error("❌ Media/Calling Error:", err);
                alert("Failed to access camera/microphone");
                navigate(-1);
            }
        };

        startCalling();

        socket.on('call-ended', () => {
            console.log("🛑 Call ended by other party");
            cleanupAndExit();
        });

        return () => {
            socket.off('call-accepted');
            socket.off('call-ended');
            if (connectionRef.current) connectionRef.current.destroy();
        };
    }, [caller?.id, caller?._id]);

    const cleanupAndExit = () => {
        if (stream) stream.getTracks().forEach(t => t.stop());
        if (connectionRef.current) connectionRef.current.destroy();
        navigate('/');
    };

    const leaveCall = () => {
        const targetId = (caller.id || caller._id).toString();
        socket.emit('end-call', { to: targetId });
        cleanupAndExit();
    };

    const toggleMic = () => {
        if (stream) {
            const track = stream.getAudioTracks()[0];
            track.enabled = !track.enabled;
            setMicOn(track.enabled);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const track = stream.getVideoTracks()[0];
            track.enabled = !track.enabled;
            setVideoOn(track.enabled);
        }
    };

    if (!caller) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
            {/* Main Remote Video */}
            <div className="absolute inset-0 z-0 bg-slate-900 flex items-center justify-center">
                <video
                    playsInline
                    ref={userVideo}
                    autoPlay
                    className={`h-full w-full object-cover transition-opacity duration-1000 ${callAccepted ? 'opacity-100' : 'opacity-0'}`}
                />

                {!callAccepted && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8">
                        <div className="relative">
                            <Avatar className="w-32 h-32 border-4 border-white/10 shadow-2xl">
                                <AvatarImage src={caller?.avatar} />
                                <AvatarFallback className="text-4xl bg-blue-600 text-white font-bold">
                                    {caller?.username?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping scale-150"></div>
                        </div>
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-white mb-2">{caller?.username}</h2>
                            <p className="text-blue-400 font-bold uppercase tracking-widest text-xs animate-pulse">
                                {incoming ? "Connecting Video..." : "Calling Out..."}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Local PiP Video */}
            <motion.div
                layout
                className={`absolute z-20 overflow-hidden rounded-3xl border-2 border-white/10 shadow-2xl bg-black transition-all
                    ${isFullScreen ? 'inset-0 rounded-none' : 'bottom-24 right-4 md:bottom-10 md:right-10 w-32 h-44 md:w-48 md:h-64'}`}
            >
                <video playsInline muted ref={myVideo} autoPlay className="h-full w-full object-cover" />
                {!videoOn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                        <VideoOff className="w-8 h-8 text-slate-500" />
                    </div>
                )}
            </motion.div>

            {/* Controls Overlay */}
            <div className="absolute top-6 left-6 z-30">
                <Button
                    variant="ghost"
                    size="icon"
                    className="bg-black/20 backdrop-blur-md rounded-full text-white"
                    onClick={() => setIsFullScreen(!isFullScreen)}
                >
                    {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </Button>
            </div>

            <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center px-4">
                <div className="bg-white/10 backdrop-blur-2xl px-6 py-4 rounded-full flex items-center gap-6 border border-white/10 shadow-2xl">
                    <Button
                        size="icon"
                        variant="ghost"
                        className={`w-12 h-12 rounded-full transition-all ${micOn ? 'bg-white/10 text-white' : 'bg-red-500 text-white'}`}
                        onClick={toggleMic}
                    >
                        {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                    </Button>

                    <Button
                        size="icon"
                        variant="destructive"
                        className="w-16 h-16 rounded-full shadow-lg shadow-red-500/20 active:scale-95 transition-transform"
                        onClick={leaveCall}
                    >
                        <PhoneOff className="w-8 h-8 md:w-10 md:h-10" />
                    </Button>

                    <Button
                        size="icon"
                        variant="ghost"
                        className={`w-12 h-12 rounded-full transition-all ${videoOn ? 'bg-white/10 text-white' : 'bg-red-500 text-white'}`}
                        onClick={toggleVideo}
                    >
                        {videoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
