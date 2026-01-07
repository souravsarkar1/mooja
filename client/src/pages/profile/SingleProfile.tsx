import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Grid2X2,
    MessageCircle,
    UserPlus,
    MoreVertical,
    Sparkles,
    Film,
    MapPin,
    Link as LinkIcon,
    ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/api/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface UserProfile {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    online: boolean;
}

const SingleProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFollowed, setIsFollowed] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await api.get(`/users/${id}`);
                setUser(data);
            } catch (err) {
                console.error('Error fetching profile:', err);
                navigate('/search');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchUser();
    }, [id, navigate]);

    // Mock posts for other user
    const mockPosts = Array(6).fill(null).map((_, i) => ({
        id: i,
        url: `https://picsum.photos/seed/${id}${i}/600/600`,
    }));

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Nav Header */}
            <div className="fixed top-0 inset-x-0 h-16 flex items-center justify-between px-4 z-50 bg-white/10 backdrop-blur-xl">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20"
                >
                    <MoreVertical className="w-5 h-5" />
                </Button>
            </div>

            {/* Cover */}
            <div className="h-48 bg-gradient-to-br from-violet-600 to-fuchsia-600 relative">
                <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Profile Info */}
            <div className="px-6 -mt-12 relative z-10">
                <div className="flex flex-col items-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-1.5 rounded-[2.5rem] bg-white shadow-2xl"
                    >
                        <div className="p-1 rounded-[2.3rem] bg-gradient-to-tr from-violet-500 to-fuchsia-500 relative">
                            <Avatar className="h-32 w-32 rounded-[2.2rem] border-4 border-white">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback className="bg-violet-50 text-violet-600 text-3xl font-black">
                                    {user?.username?.[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {user?.online && (
                                <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-white rounded-full bg-clip-padding" />
                            )}
                        </div>
                    </motion.div>

                    <div className="mt-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{user?.username}</h1>
                            <ShieldCheck className="w-5 h-5 text-violet-500 fill-violet-50" />
                        </div>
                        <div className="mt-1 flex items-center justify-center gap-2">
                            <Badge text="Digital Creator" />
                            <Badge text="Musician" />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center gap-10 mt-8 w-full">
                        <StatItem label="Posts" value="42" />
                        <StatItem label="Followers" value="1.2K" />
                        <StatItem label="Following" value="312" />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-8 w-full max-w-sm">
                        <Button
                            onClick={() => setIsFollowed(!isFollowed)}
                            className={`flex-1 rounded-2xl font-bold h-12 transition-all duration-300 ${isFollowed ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-200'}`}
                        >
                            {isFollowed ? 'Following' : <> <UserPlus className="w-4 h-4 mr-2" /> Follow </>}
                        </Button>
                        <Button
                            onClick={() => navigate(`/chat/${user?._id}`)}
                            variant="outline"
                            className="flex-1 rounded-2xl border-gray-200 font-bold h-12 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600"
                        >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                        </Button>
                    </div>

                    {/* Metadata */}
                    <div className="mt-8 flex flex-col items-center space-y-3">
                        <p className="text-gray-600 text-[13px] font-medium text-center px-4">
                            Exploring the intersection of art and code. 🎨💻
                            Always down for a collab!
                        </p>
                        <div className="flex gap-4">
                            <MetadataItem icon={<MapPin size={12} />} text="Worldwide" />
                            <MetadataItem icon={<LinkIcon size={12} />} text="vibe.me/user" color="text-violet-600" />
                        </div>
                    </div>
                </div>

                <Separator className="my-10 opacity-50" />

                {/* Tabs */}
                <Tabs defaultValue="grid" className="w-full">
                    <TabsList className="bg-transparent w-full flex justify-center gap-12 h-auto p-0 border-none">
                        <TabsTrigger value="grid" className="data-[state=active]:text-violet-600 data-[state=active]:border-b-2 data-[state=active]:border-violet-600 rounded-none h-12 px-2 font-black text-gray-400 bg-transparent">
                            <Grid2X2 className="w-5 h-5" />
                        </TabsTrigger>
                        <TabsTrigger value="reels" className="data-[state=active]:text-violet-600 data-[state=active]:border-b-2 data-[state=active]:border-violet-600 rounded-none h-12 px-2 font-black text-gray-400 bg-transparent">
                            <Film className="w-5 h-5" />
                        </TabsTrigger>
                        <TabsTrigger value="tagged" className="data-[state=active]:text-violet-600 data-[state=active]:border-b-2 data-[state=active]:border-violet-600 rounded-none h-12 px-2 font-black text-gray-400 bg-transparent">
                            <Sparkles className="w-5 h-5" />
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="grid" className="mt-8">
                        <div className="grid grid-cols-3 gap-1 md:gap-4">
                            {mockPosts.map((post) => (
                                <div key={post.id} className="aspect-square rounded-xl overflow-hidden shadow-sm hover:scale-[1.02] transition-transform cursor-pointer">
                                    <img src={post.url} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="reels" className="mt-8 text-center text-gray-400 font-bold py-10">
                        No Reels shared yet
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

const StatItem = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col items-center">
        <span className="text-xl font-black text-gray-900">{value}</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{label}</span>
    </div>
);

const Badge = ({ text }: { text: string }) => (
    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
        {text}
    </span>
);

const MetadataItem = ({ icon, text, color = "text-gray-400" }: { icon: React.ReactNode, text: string, color?: string }) => (
    <div className={`flex items-center gap-1.5 text-[11px] font-bold ${color}`}>
        {icon}
        <span>{text}</span>
    </div>
);

export default SingleProfile;