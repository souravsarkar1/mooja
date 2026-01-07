import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart,
    MessageCircle,
    Share2,
    Music2,
    MoreVertical,
    Volume2,
    VolumeX,
    // UserPlus,
    Play
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
// import { ScrollArea } from '@/components/ui/scroll-area';

interface Reel {
    id: string;
    videoUrl: string;
    username: string;
    avatar: string;
    caption: string;
    likes: string;
    comments: string;
    audioName: string;
    isLiked: boolean;
}

const MOCK_REELS: Reel[] = [
    {
        id: '1',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-dancing-alone-34446-large.mp4',
        username: 'urban_hype',
        avatar: 'https://i.pravatar.cc/150?u=urban',
        caption: 'Late night vibes in the city 🌃✨ #neon #dance #vibes',
        likes: '12.4K',
        comments: '1.2K',
        audioName: 'Cyberpunk 2077 - Original Soundtrack',
        isLiked: false
    },
    {
        id: '2',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-leaves-low-angle-shot-1479-large.mp4',
        username: 'nature_explorer',
        avatar: 'https://i.pravatar.cc/150?u=nature',
        caption: 'Golden hour hits different in autumn 🍂💛 #nature #goldenhour',
        likes: '8.9K',
        comments: '456',
        audioName: 'Lofi Girl - Study Beats',
        isLiked: true
    },
    {
        id: '3',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fast-food-hamburger-close-up-1596-large.mp4',
        username: 'foodie_heaven',
        avatar: 'https://i.pravatar.cc/150?u=food',
        caption: 'The perfect burger doesnt exi... 🍔🤤 #burgers #cheatmeal',
        likes: '25.1K',
        comments: '2.8K',
        audioName: 'Upbeat Funk - Happy Music',
        isLiked: false
    }
];

const Reels = () => {
    const [muted, setMuted] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollTop = e.currentTarget.scrollTop;
        const height = e.currentTarget.clientHeight;
        const newIndex = Math.round(scrollTop / height);
        if (newIndex !== activeIndex) {
            setActiveIndex(newIndex);
        }
    };

    return (
        <div className="h-screen bg-black overflow-hidden flex flex-col pt-safe pb-16">
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar"
                style={{ scrollBehavior: 'smooth' }}
            >
                {MOCK_REELS.map((reel, index) => (
                    <ReelItem
                        key={reel.id}
                        reel={reel}
                        isActive={index === activeIndex}
                        muted={muted}
                        setMuted={setMuted}
                    />
                ))}
            </div>

            {/* Top Bar Overlay */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/40 to-transparent pointer-events-none">
                <h1 className="text-xl font-black text-white tracking-widest pointer-events-auto">REELS</h1>
                <div className="flex gap-4 pointer-events-auto">
                    <button onClick={() => setMuted(!muted)} className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20">
                        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <button className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReelItem = ({ reel, isActive, muted }: { reel: Reel, isActive: boolean, muted: boolean, setMuted: (m: boolean) => void }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [playing, setPlaying] = useState(false);
    const [liked, setLiked] = useState(reel.isLiked);
    const [showLikeAnim, setShowLikeAnim] = useState(false);

    useEffect(() => {
        if (isActive) {
            videoRef.current?.play().catch(() => setPlaying(false));
            setPlaying(true);
        } else {
            videoRef.current?.pause();
            videoRef.current!.currentTime = 0;
            setPlaying(false);
        }
    }, [isActive]);

    const togglePlay = () => {
        if (playing) {
            videoRef.current?.pause();
        } else {
            videoRef.current?.play();
        }
        setPlaying(!playing);
    };

    const handleDoubleTap = () => {
        setLiked(true);
        setShowLikeAnim(true);
        setTimeout(() => setShowLikeAnim(false), 800);
    };

    return (
        <div className="h-full w-full snap-start relative bg-neutral-900 group">
            {/* Video Player */}
            <video
                ref={videoRef}
                src={reel.videoUrl}
                className="h-full w-full object-cover"
                loop
                muted={muted}
                playsInline
                onClick={togglePlay}
                onDoubleClick={handleDoubleTap}
            />

            {/* Tap to Play/Pause Indicator */}
            {!playing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="p-6 rounded-full bg-black/40 backdrop-blur-sm">
                        <Play className="text-white fill-white ml-1" size={40} />
                    </div>
                </div>
            )}

            {/* Like Animation Overlay */}
            <AnimatePresence>
                {showLikeAnim && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 1 }}
                        exit={{ scale: 2, opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                    >
                        <Heart className="text-pink-500 fill-pink-500" size={120} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Content Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 pb-8 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex justify-between items-end gap-4">
                <div className="flex-1 space-y-4 max-w-[80%]">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-white/50 shadow-xl">
                            <AvatarImage src={reel.avatar} />
                            <AvatarFallback>{reel.username[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-white text-sm">@{reel.username}</span>
                        <Button variant="outline" size="sm" className="h-7 px-3 bg-white/20 border-white/30 text-white rounded-full font-bold text-xs hover:bg-white/30">
                            Follow
                        </Button>
                    </div>

                    <p className="text-white text-sm font-medium line-clamp-2 leading-relaxed">
                        {reel.caption}
                    </p>

                    <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-full px-3 py-1.5 w-fit border border-white/10 group-hover:bg-black/50 transition-colors">
                        <Music2 size={14} className="text-white animate-pulse" />
                        <div className="overflow-hidden w-40">
                            <p className="text-white text-[11px] font-bold whitespace-nowrap animate-marquee">
                                {reel.audioName}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex flex-col items-center gap-6 mb-2">
                    <div className="flex flex-col items-center gap-1.5 cursor-pointer group/action" onClick={() => setLiked(!liked)}>
                        <div className={`p-3 rounded-full transition-all duration-300 ${liked ? 'bg-pink-500/20' : 'bg-black/20 group-hover/action:bg-black/40'}`}>
                            <Heart className={`transition-all duration-300 ${liked ? 'text-pink-500 fill-pink-500 scale-110' : 'text-white group-hover/action:scale-110'}`} size={28} />
                        </div>
                        <span className="text-white text-[11px] font-bold shadow-sm">{reel.likes}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 cursor-pointer group/action">
                        <div className="p-3 rounded-full bg-black/20 group-hover/action:bg-black/40 transition-all duration-300">
                            <MessageCircle className="text-white group-hover/action:scale-110 transition-transform" size={28} />
                        </div>
                        <span className="text-white text-[11px] font-bold shadow-sm">{reel.comments}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 cursor-pointer group/action">
                        <div className="p-3 rounded-full bg-black/20 group-hover/action:bg-black/40 transition-all duration-300">
                            <Share2 className="text-white group-hover/action:scale-110 transition-transform" size={28} />
                        </div>
                        <span className="text-white text-[11px] font-bold shadow-sm">Share</span>
                    </div>

                    <div className="relative mt-2">
                        <div className="h-10 w-10 rounded-full border-2 border-white/50 overflow-hidden animate-spin-slow shadow-xl">
                            <img src={reel.avatar} className="h-full w-full object-cover" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full text-black">
                            <Music2 size={10} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Marquee Style */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 8s linear infinite;
                }
                .animate-spin-slow {
                    animation: spin 6s linear infinite;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default Reels;