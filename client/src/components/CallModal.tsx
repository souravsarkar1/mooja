import { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';
import { socket } from '@/lib/socket';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Phone, PhoneOff } from 'lucide-react';
import ringtone from '@/lib/master_teaser_bgm.mp3';

export default function CallModal({ open, onOpenChange, caller, incoming, signal }: any) {
    const { user } = useAuthStore();
    const [callAccepted, setCallAccepted] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const myVideo = useRef<HTMLVideoElement>(null);
    const userVideo = useRef<HTMLVideoElement>(null);
    const connectionRef = useRef<Peer.Instance | null>(null);
    const ringtoneRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (open && !callAccepted) {
            ringtoneRef.current = new Audio(ringtone);
            ringtoneRef.current.loop = true;
            ringtoneRef.current.play().catch(err => console.error("Audio play failed:", err));
        }

        return () => {
            if (ringtoneRef.current) {
                ringtoneRef.current.pause();
                ringtoneRef.current = null;
            }
        };
    }, [open, callAccepted]);

    useEffect(() => {
        if (open) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
                setStream(currentStream);
                if (myVideo.current) myVideo.current.srcObject = currentStream;

                if (!incoming && caller) {
                    const peer = new Peer({ initiator: true, trickle: false, stream: currentStream });

                    peer.on('signal', (data) => {
                        const targetId = (caller._id || caller.id).toString();
                        console.log("Emitting call-user to:", targetId);
                        socket.emit('call-user', {
                            userToCall: targetId,
                            signalData: data,
                            from: user?.id,
                            name: user?.username,
                        });
                    });

                    peer.on('stream', (remoteStream) => {
                        if (userVideo.current) userVideo.current.srcObject = remoteStream;
                    });

                    socket.on('call-accepted', (signal) => {
                        setCallAccepted(true);
                        peer.signal(signal);
                    });

                    connectionRef.current = peer;
                }
            });
        } else {
            stopStream();
            connectionRef.current?.destroy();
            socket.off('call-accepted');
        }

        return () => {
            socket.off('call-accepted');
        };
    }, [open, incoming, caller, user]);

    const stopStream = () => {
        stream?.getTracks().forEach(track => track.stop());
        setStream(null);
        setCallAccepted(false);
    };

    const answerCall = () => {
        setCallAccepted(true);
        const peer = new Peer({ initiator: false, trickle: false, stream: stream! });

        peer.on('signal', (data) => {
            const targetId = (caller.id || caller._id).toString();
            socket.emit('answer-call', { signal: data, to: targetId });
        });

        peer.on('stream', (currentStream) => {
            if (userVideo.current) userVideo.current.srcObject = currentStream;
        });

        peer.signal(signal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        if (caller) {
            socket.emit('end-call', { to: caller.id || caller._id });
        }
        connectionRef.current?.destroy();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md md:max-w-[700px] h-[550px] bg-slate-900 border-none p-0 overflow-hidden shadow-2xl ring-1 ring-white/10">
                <DialogHeader className="sr-only">
                    <DialogTitle>{incoming ? 'Incoming Call' : 'Outgoing Call'}</DialogTitle>
                    <DialogDescription>
                        {incoming ? `Call from ${caller?.username}` : `Calling ${caller?.username}`}
                    </DialogDescription>
                </DialogHeader>
                <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-950">

                    {/* Background Visualizer Animation (only when ringing) */}
                    {!callAccepted && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                            <div className="w-[300px] h-[300px] bg-blue-500 rounded-full animate-ping opacity-75"></div>
                            <div className="absolute w-[450px] h-[450px] bg-blue-600 rounded-full animate-ping [animation-delay:0.5s] opacity-50"></div>
                        </div>
                    )}

                    {/* Peer Video or Ringing Profile */}
                    <div className="absolute inset-0 z-0">
                        {callAccepted ? (
                            <video playsInline ref={userVideo} autoPlay className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-white space-y-6 px-4 text-center">
                                <div className="relative">
                                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-5xl font-bold shadow-2xl ring-4 ring-white/20 animate-in zoom-in-50 duration-500">
                                        {caller?.username?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-slate-900"></div>
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg">
                                        {incoming ? `${caller?.username}` : `Calling ${caller?.username}...`}
                                    </h2>
                                    <p className="text-blue-300 font-medium tracking-widest uppercase text-xs animate-pulse">
                                        {incoming ? "Incoming Voice Call" : "Ringing..."}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* My Preview (Picture in Picture) */}
                    <div className={`absolute top-6 right-6 w-40 h-28 bg-black rounded-xl border-2 border-slate-700/50 overflow-hidden shadow-2xl z-20 transition-transform duration-500 ${callAccepted ? 'scale-100' : 'scale-90 opacity-80'}`}>
                        <video playsInline muted ref={myVideo} autoPlay className="h-full w-full object-cover" />
                    </div>

                    {/* Controls Bar */}
                    <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-8 z-30 animate-in slide-in-from-bottom-5 duration-700">
                        {incoming && !callAccepted ? (
                            <div className="flex flex-col items-center gap-3">
                                <Button
                                    size="lg"
                                    className="bg-green-500 hover:bg-green-600 rounded-full p-4 h-20 w-20 shadow-xl shadow-green-500/20 hover:scale-110 active:scale-95 transition-all animate-bounce"
                                    onClick={answerCall}
                                >
                                    <Phone className="w-10 h-10 fill-current" />
                                </Button>
                                <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Accept</span>
                            </div>
                        ) : null}

                        <div className="flex flex-col items-center gap-3">
                            <Button
                                size="lg"
                                variant="destructive"
                                className="bg-red-500 hover:bg-red-600 rounded-full p-4 h-16 w-16 shadow-xl shadow-red-500/20 hover:scale-110 active:scale-95 transition-all"
                                onClick={leaveCall}
                            >
                                <PhoneOff className="w-8 h-8" />
                            </Button>
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                                {incoming && !callAccepted ? "Decline" : "End"}
                            </span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
