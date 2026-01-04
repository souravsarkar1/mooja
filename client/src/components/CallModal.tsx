import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Phone, PhoneOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ringtone from '@/lib/master_teaser_bgm.mp3';

export default function CallModal({ open, onOpenChange, caller, onAnswer, onDecline }: any) {
    const ringtoneRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (open) {
            ringtoneRef.current = new Audio(ringtone);
            ringtoneRef.current.loop = true;
            ringtoneRef.current.play().catch(err => console.error("Audio play failed:", err));
        } else {
            if (ringtoneRef.current) {
                ringtoneRef.current.pause();
                ringtoneRef.current = null;
            }
        }

        return () => {
            if (ringtoneRef.current) {
                ringtoneRef.current.pause();
                ringtoneRef.current = null;
            }
        };
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-slate-900 border-none p-0 overflow-hidden shadow-2xl ring-1 ring-white/10 rounded-3xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>Incoming Call</DialogTitle>
                    <DialogDescription>Call from {caller?.username}</DialogDescription>
                </DialogHeader>

                <div className="p-8 flex flex-col items-center gap-6 bg-gradient-to-b from-slate-800 to-slate-950">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping scale-150"></div>
                        <Avatar className="w-24 h-24 border-4 border-white/10 shadow-2xl relative z-10">
                            <AvatarImage src={caller?.avatar} />
                            <AvatarFallback className="text-3xl bg-blue-600 text-white font-bold uppercase">
                                {caller?.username?.[0]}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="text-center space-y-1">
                        <h2 className="text-2xl font-bold text-white tracking-tight">{caller?.username}</h2>
                        <p className="text-blue-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">
                            Incoming Video Call
                        </p>
                    </div>

                    <div className="flex items-center gap-8 mt-4">
                        <div className="flex flex-col items-center gap-2">
                            <Button
                                size="lg"
                                className="bg-red-500 hover:bg-red-600 rounded-full p-0 h-16 w-16 shadow-xl shadow-red-500/20 active:scale-90 transition-all"
                                onClick={onDecline}
                            >
                                <PhoneOff className="w-8 h-8" />
                            </Button>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Decline</span>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <Button
                                size="lg"
                                className="bg-green-500 hover:bg-green-600 rounded-full p-0 h-16 w-16 shadow-xl shadow-green-500/20 active:scale-95 transition-all animate-bounce"
                                onClick={onAnswer}
                            >
                                <Phone className="w-8 h-8 fill-current" />
                            </Button>
                            <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Answer</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
