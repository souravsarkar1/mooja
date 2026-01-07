// import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Settings,
    Grid2X2,
    Bookmark,
    Heart,
    LogOut,
    Edit3,
    MapPin,
    Link as LinkIcon,
    Sparkles,
    Film,
    Calendar,
    MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const Profile = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    // const [activeTab, setActiveTab] = useState('posts');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Mock data for posts grid
    const mockPosts = Array(9).fill(null).map((_, i) => ({
        id: i,
        url: `https://picsum.photos/seed/${i + 50}/600/600`,
        likes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 100)
    }));

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header / Cover Section */}
            <div className="relative h-48 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
                <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/20"
                    >
                        <Settings className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-red-500/80 border border-white/20 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Profile Info Section */}
            <div className="px-6 -mt-12 relative z-10">
                <div className="flex flex-col items-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-1.5 rounded-[2rem] bg-white shadow-xl"
                    >
                        <div className="p-1 rounded-[1.8rem] bg-gradient-to-tr from-violet-500 to-fuchsia-500">
                            <Avatar className="h-28 w-28 rounded-[1.7rem] border-4 border-white">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback className="bg-violet-50 text-violet-600 text-3xl font-black">
                                    {user?.username?.[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </motion.div>

                    <div className="mt-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{user?.username}</h1>
                            <Sparkles className="w-5 h-5 text-violet-500 animate-pulse" />
                        </div>
                        <p className="text-gray-500 font-medium text-sm">@{user?.username?.toLowerCase()}</p>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center gap-8 mt-6 w-full max-w-sm">
                        <StatItem label="Posts" value="128" />
                        <StatItem label="Followers" value="12.5K" />
                        <StatItem label="Following" value="842" />
                    </div>

                    <div className="flex gap-3 mt-8 w-full max-w-md">
                        <Button className="flex-1 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold h-12 shadow-lg shadow-gray-200">
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Profile
                        </Button>
                        <Button variant="outline" className="flex-1 rounded-2xl border-gray-200 font-bold h-12 hover:bg-gray-50">
                            Share Profile
                        </Button>
                    </div>

                    {/* Bio & Links */}
                    <div className="mt-8 text-center space-y-3 max-w-md">
                        <p className="text-gray-700 text-sm leading-relaxed font-medium">
                            ✨ Creating digital magic | 📸 Photography & Tech
                            📍 Living life in high definition
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 text-[12px] font-bold text-gray-400">
                            <div className="flex items-center gap-1">
                                <MapPin size={14} className="text-violet-500" />
                                <span>San Francisco</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <LinkIcon size={14} className="text-fuchsia-500" />
                                <span className="text-violet-600">mooja.io/creative</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>Joined Dec 2023</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="my-10 opacity-50" />

                {/* Content Tabs */}
                <Tabs defaultValue="posts" className="w-full">
                    <TabsList className="bg-transparent w-full flex justify-center gap-8 h-auto p-0 border-none">
                        <TabsTrigger
                            value="posts"
                            className="data-[state=active]:bg-transparent data-[state=active]:text-violet-600 data-[state=active]:border-b-2 data-[state=active]:border-violet-600 rounded-none h-12 px-2 font-bold text-gray-400 transition-all border-b-2 border-transparent"
                        >
                            <Grid2X2 className="w-5 h-5 mr-2" />
                            Posts
                        </TabsTrigger>
                        <TabsTrigger
                            value="reels"
                            className="data-[state=active]:bg-transparent data-[state=active]:text-violet-600 data-[state=active]:border-b-2 data-[state=active]:border-violet-600 rounded-none h-12 px-2 font-bold text-gray-400 transition-all border-b-2 border-transparent"
                        >
                            <Film className="w-5 h-5 mr-2" />
                            Reels
                        </TabsTrigger>
                        <TabsTrigger
                            value="saved"
                            className="data-[state=active]:bg-transparent data-[state=active]:text-violet-600 data-[state=active]:border-b-2 data-[state=active]:border-violet-600 rounded-none h-12 px-2 font-bold text-gray-400 transition-all border-b-2 border-transparent"
                        >
                            <Bookmark className="w-5 h-5 mr-2" />
                            Saved
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="posts" className="mt-8">
                        <div className="grid grid-cols-3 gap-1 md:gap-4 px-1">
                            {mockPosts.map((post) => (
                                <motion.div
                                    key={post.id}
                                    whileHover={{ scale: 1.02 }}
                                    className="aspect-square relative group cursor-pointer overflow-hidden rounded-xl md:rounded-2xl shadow-sm"
                                >
                                    <img
                                        src={post.url}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                                        <div className="flex items-center gap-1 font-bold">
                                            <Heart className="w-4 h-4 fill-white" />
                                            <span className="text-sm">{post.likes}</span>
                                        </div>
                                        <div className="flex items-center gap-1 font-bold">
                                            <MessageCircle className="w-4 h-4 fill-white" />
                                            <span className="text-sm">{post.comments}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="reels" className="mt-8">
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="p-6 rounded-full bg-violet-50 text-violet-600">
                                <Film size={40} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Your Reels</h3>
                                <p className="text-gray-500 text-sm max-w-[200px]">Capture and share your best moments in motion.</p>
                            </div>
                            <Button className="rounded-full bg-violet-600 text-white px-8">Create Reel</Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="saved" className="mt-8">
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="p-6 rounded-full bg-pink-50 text-pink-600">
                                <Bookmark size={40} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Saved Vibe</h3>
                                <p className="text-gray-500 text-sm max-w-[200px]">Only you can see what you've saved here.</p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

const StatItem = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col items-center">
        <span className="text-xl font-black text-gray-900">{value}</span>
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
);

export default Profile;