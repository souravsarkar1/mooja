import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/store/useAuthStore';
import {
    Heart,
    MessageCircle,
    Share2,
    Bookmark,
    MoreHorizontal,
    Plus,
    Sparkles,
    TrendingUp,
    MapPin,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock data for feed posts
const mockPosts = [
    {
        id: '1',
        user: {
            username: 'sarah_designer',
            avatar: '',
            verified: true,
        },
        image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800',
        likes: 1234,
        caption: 'Exploring the beauty of nature 🌿✨ Sometimes you just need to disconnect to reconnect.',
        comments: 89,
        timeAgo: '2h',
        location: 'Bali, Indonesia',
    },
    {
        id: '2',
        user: {
            username: 'alex_travels',
            avatar: '',
            verified: false,
        },
        image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
        likes: 892,
        caption: 'Mountain mornings hit different 🏔️ #wanderlust #adventure',
        comments: 45,
        timeAgo: '4h',
        location: 'Swiss Alps',
    },
    {
        id: '3',
        user: {
            username: 'foodie_mike',
            avatar: '',
            verified: true,
        },
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
        likes: 2156,
        caption: 'Weekend brunch goals 🍳☕ Tag someone who needs this!',
        comments: 134,
        timeAgo: '6h',
        location: 'New York City',
    },
];

// Mock data for stories
const mockStories = [
    { id: 'your-story', username: 'Your Story', hasNew: false, isOwn: true },
    { id: '1', username: 'emma_w', hasNew: true, isOwn: false },
    { id: '2', username: 'john_dev', hasNew: true, isOwn: false },
    { id: '3', username: 'lisa_art', hasNew: true, isOwn: false },
    { id: '4', username: 'mike_fit', hasNew: false, isOwn: false },
    { id: '5', username: 'sara_cook', hasNew: true, isOwn: false },
    { id: '6', username: 'tom_music', hasNew: false, isOwn: false },
    { id: '7', username: 'amy_photo', hasNew: true, isOwn: false },
];

const Feed = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
    // const [activeTab, setActiveTab] = useState('home');

    const toggleLike = (postId: string) => {
        setLikedPosts((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
            }
            return newSet;
        });
    };

    const toggleSave = (postId: string) => {
        setSavedPosts((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
            }
            return newSet;
        });
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return num.toString();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
            {/* Premium Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-100/50">
                <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                        Mooja
                    </h1>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-violet-50 transition-colors">
                            <TrendingUp className="w-5 h-5 text-gray-700" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-violet-50 transition-colors relative"
                            onClick={() => navigate('/')}
                        >
                            <MessageCircle className="w-5 h-5 text-gray-700" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full"></span>
                        </Button>
                    </div>
                </div>

                {/* Stories Section */}
                <div className="max-w-lg mx-auto px-4 pb-3">
                    <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
                        {mockStories.map((story) => (
                            <div key={story.id} className="flex flex-col items-center gap-1.5 min-w-fit">
                                <div className={`p-[2.5px] rounded-full ${story.hasNew || story.isOwn ? 'bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500' : 'bg-gray-200'}`}>
                                    <div className="bg-white p-[2px] rounded-full">
                                        <div className="relative">
                                            <Avatar className="h-14 w-14 ring-0">
                                                <AvatarImage src="" />
                                                <AvatarFallback className={`text-sm font-semibold ${story.isOwn ? 'bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-600' : 'bg-gradient-to-br from-slate-100 to-gray-100 text-gray-600'}`}>
                                                    {story.isOwn ? user?.username?.[0]?.toUpperCase() || 'Y' : story.username[0].toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            {story.isOwn && (
                                                <div className="absolute bottom-0 right-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full p-0.5 border-2 border-white">
                                                    <Plus className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-medium truncate max-w-[60px] ${story.isOwn ? 'text-gray-600' : 'text-gray-500'}`}>
                                    {story.isOwn ? 'Your Story' : story.username}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Feed Content */}
            <ScrollArea className="flex-1">
                <div className="max-w-lg mx-auto pb-20">
                    {/* Trending Topics */}
                    <div className="px-4 py-3">
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                            {['✨ For You', '🔥 Trending', '🎵 Music', '🎮 Gaming', '📸 Photography'].map((topic, idx) => (
                                <button
                                    key={topic}
                                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${idx === 0
                                        ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-200'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                                        }`}
                                >
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Posts */}
                    <div className="space-y-6 px-4 pt-2">
                        {mockPosts.map((post) => (
                            <article key={post.id} className="bg-white rounded-3xl shadow-sm shadow-gray-100/50 overflow-hidden border border-gray-100/50">
                                {/* Post Header */}
                                <div className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-[2px] rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500">
                                            <Avatar className="h-10 w-10 border-2 border-white">
                                                <AvatarImage src={post.user.avatar} />
                                                <AvatarFallback className="bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-600 font-semibold">
                                                    {post.user.username[0].toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-semibold text-sm text-gray-900">{post.user.username}</span>
                                                {post.user.verified && (
                                                    <div className="bg-gradient-to-r from-blue-500 to-violet-500 rounded-full p-0.5">
                                                        <Sparkles className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                                <MapPin className="w-3 h-3" />
                                                <span>{post.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-gray-50">
                                        <MoreHorizontal className="w-5 h-5 text-gray-500" />
                                    </Button>
                                </div>

                                {/* Post Image */}
                                <div className="relative aspect-square bg-gray-100">
                                    <img
                                        src={post.image}
                                        alt={post.caption}
                                        className="w-full h-full object-cover"
                                        onDoubleClick={() => toggleLike(post.id)}
                                    />
                                    {/* Double-tap heart animation would go here */}
                                </div>

                                {/* Post Actions */}
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => toggleLike(post.id)}
                                                className={`transition-all transform hover:scale-110 active:scale-95 ${likedPosts.has(post.id) ? 'text-pink-500' : 'text-gray-700 hover:text-gray-900'}`}
                                            >
                                                <Heart className={`w-6 h-6 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                                            </button>
                                            <button className="text-gray-700 hover:text-gray-900 transition-colors hover:scale-110 transform active:scale-95">
                                                <MessageCircle className="w-6 h-6" />
                                            </button>
                                            <button className="text-gray-700 hover:text-gray-900 transition-colors hover:scale-110 transform active:scale-95">
                                                <Share2 className="w-6 h-6" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => toggleSave(post.id)}
                                            className={`transition-all transform hover:scale-110 active:scale-95 ${savedPosts.has(post.id) ? 'text-violet-500' : 'text-gray-700 hover:text-gray-900'}`}
                                        >
                                            <Bookmark className={`w-6 h-6 ${savedPosts.has(post.id) ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>

                                    {/* Likes Count */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-1.5">
                                            {[1, 2, 3].map((i) => (
                                                <Avatar key={i} className="h-5 w-5 border-2 border-white">
                                                    <AvatarFallback className="text-[8px] bg-gradient-to-br from-violet-200 to-fuchsia-200 text-violet-600">
                                                        {String.fromCharCode(65 + i)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ))}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {formatNumber(post.likes + (likedPosts.has(post.id) ? 1 : 0))} likes
                                        </span>
                                    </div>

                                    {/* Caption */}
                                    <p className="text-sm text-gray-800">
                                        <span className="font-semibold mr-1.5">{post.user.username}</span>
                                        {post.caption}
                                    </p>

                                    {/* Comments Link */}
                                    <button className="text-sm text-gray-400 hover:text-gray-500 transition-colors">
                                        View all {post.comments} comments
                                    </button>

                                    {/* Time */}
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{post.timeAgo} ago</p>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* End of Feed Message */}
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 mb-4">
                            <Sparkles className="w-8 h-8 text-violet-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">You're all caught up</h3>
                        <p className="text-sm text-gray-500">You've seen all new posts from the last 3 days</p>
                    </div>
                </div>
            </ScrollArea>

            {/* Floating Create Button */}
            <button className="fixed right-4 bottom-24 w-14 h-14 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-full shadow-lg shadow-violet-300 flex items-center justify-center text-white transform hover:scale-105 active:scale-95 transition-all z-40">
                <Plus className="w-7 h-7" />
            </button>

            {/* Premium Bottom Navigation */}


            {/* Custom Scrollbar Hide CSS */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default Feed;