import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, MessageCircle, Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import api from '@/api/api';

interface SearchResult {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
}

const SearchPage = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [discoverUsers, setDiscoverUsers] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        fetchDiscoverUsers();
    }, []);

    useEffect(() => {
        if (query.trim()) {
            const delayDebounce = setTimeout(() => {
                handleSearch();
            }, 300);
            return () => clearTimeout(delayDebounce);
        } else {
            setResults([]);
            setSearching(false);
        }
    }, [query]);

    const fetchDiscoverUsers = async () => {
        try {
            const { data } = await api.get('/users/discover');
            setDiscoverUsers(data);
        } catch (err) {
            console.error('Error fetching discover users:', err);
        }
    };

    const handleSearch = async () => {
        setSearching(true);
        try {
            const { data } = await api.get(`/users/search?query=${query}`);
            setResults(data);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setSearching(false);
        }
    };

    const sendFriendRequest = async (recipientId: string) => {
        try {
            await api.post('/users/friend-request', { recipientId });
        } catch (err: any) {
            console.error(err.response?.data?.message || 'Error sending request');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-violet-50/30 to-white pb-20 safe-area-inset">
            {/* Header - Mobile Optimized */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100/50">
                <div className="px-4 pt-safe pt-6 pb-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-black text-[#8B5CF6] tracking-tight">Discover</h1>
                        <div className="bg-[#F5F3FF] text-[#8B5CF6] px-2.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold border border-[#DDD6FE]">
                            <Sparkles className="w-3 h-3" />
                            <span className="hidden xs:inline">Mooja AI</span>
                            <span className="xs:hidden">AI</span>
                        </div>
                    </div>

                    {/* Search Bar - Mobile Optimized */}
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
                        <Input
                            placeholder="Find friends..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 bg-white border-gray-200 rounded-2xl text-sm focus:border-[#8B5CF6] focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-gray-400 shadow-sm"
                        />
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <div className="px-4 py-4 space-y-6 pb-safe">
                {/* Category Chips - Horizontal Scroll */}
                {!query && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
                        {['For You', 'Trending', 'Creative', 'Lifestyle', 'Tech'].map((cat, i) => (
                            <button
                                key={cat}
                                className={`flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all ${i === 0
                                    ? 'bg-[#8B5CF6] text-white shadow-lg shadow-violet-200/50'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 active:scale-95'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {query ? (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-black text-gray-900">Search Results</h2>
                                {searching && (
                                    <div className="animate-spin w-4 h-4 border-2 border-[#8B5CF6] border-t-transparent rounded-full" />
                                )}
                            </div>
                            <div className="space-y-2.5">
                                {results.length > 0 ? (
                                    results.map((u) => (
                                        <UserCard key={u._id} user={u} onAdd={() => sendFriendRequest(u._id)} />
                                    ))
                                ) : (
                                    !searching && (
                                        <div className="text-center py-12">
                                            <p className="text-gray-400 text-sm">No results found</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="discover"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Suggested Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 bg-pink-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <TrendingUp className="w-4 h-4 text-pink-500" />
                                    </div>
                                    <h2 className="text-lg font-black text-gray-900">Suggested for you</h2>
                                </div>

                                <div className="space-y-2.5">
                                    {discoverUsers.map((u) => (
                                        <UserCard key={u._id} user={u} onAdd={() => sendFriendRequest(u._id)} />
                                    ))}
                                </div>
                            </div>

                            {/* AI Banner - Mobile Optimized */}
                            <div className="bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-violet-200/50">
                                <div className="relative z-10 space-y-3">
                                    <h3 className="text-xl font-black leading-tight">Mooja AI Search</h3>
                                    <p className="text-white/90 text-sm font-medium leading-relaxed">
                                        Smart discovery finds people with similar vibes. Just start typing!
                                    </p>
                                    <Button className="h-10 bg-white text-[#8B5CF6] hover:bg-white/90 active:scale-95 rounded-full font-bold px-5 text-sm shadow-lg transition-transform">
                                        Try AI Prompts
                                    </Button>
                                </div>
                                <Sparkles className="absolute -right-6 -top-6 w-28 h-28 text-white/10 rotate-12" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const UserCard = ({ user, onAdd }: { user: SearchResult; onAdd: () => void }) => {
    const navigate = useNavigate();

    return (
        <div className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl shadow-sm active:scale-[0.98] transition-all duration-200">
            <div
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                onClick={() => navigate(`/profile/${user._id}`)}
            >
                <div className="relative flex-shrink-0">
                    <div className="p-[2px] rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#D946EF]">
                        <Avatar className="h-12 w-12 rounded-[14px] border-2 border-white shadow-sm overflow-hidden bg-white">
                            <AvatarImage src={user.avatar} className="object-cover" />
                            <AvatarFallback className="bg-violet-50 text-violet-600 font-black text-lg">
                                {user.username[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate text-sm leading-tight">
                        {user.username}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full flex-shrink-0" />
                        <p className="text-xs font-semibold text-gray-400 truncate">
                            Online
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons - Mobile Optimized */}
            <div className="flex gap-1.5 ml-2 flex-shrink-0">
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full text-violet-600 hover:bg-violet-50 active:scale-95 transition-transform"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/chat/${user._id}`);
                    }}
                >
                    <MessageCircle className="w-4.5 h-4.5" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full text-violet-600 hover:bg-violet-50 active:scale-95 transition-transform"
                    onClick={(e) => {
                        e.stopPropagation();
                        onAdd();
                    }}
                >
                    <UserPlus className="w-4.5 h-4.5" />
                </Button>
            </div>
        </div>
    );
};

export default SearchPage;