import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Sparkles, TrendingUp, Check, X } from 'lucide-react';
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
    name?: string;
    isPending?: boolean;
    isSent?: boolean;
    isFriend?: boolean;
}

const SearchPage = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [discoverUsers, setDiscoverUsers] = useState<SearchResult[]>([]);
    const [_, setSearching] = useState(false);

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
            console.error(err);
        }
    };

    const handleSearch = async () => {
        setSearching(true);
        try {
            const { data } = await api.get(`/users/search?query=${query}`);
            setResults(data);
        } catch (err) {
            console.error(err);
        } finally {
            setSearching(false);
        }
    };

    // 🔥 HANDLE ACTION BASED ON STATUS
    const handleAction = async (user: SearchResult) => {
        try {
            if (user.isFriend) return;

            if (user.isSent || user.isPending) {
                // remove request
                await api.post('/users/remove-friend-request', {
                    userId: user._id
                });
            } else {
                // send request
                await api.post('/users/friend-request', {
                    recipientId: user._id
                });
            }

            // refresh UI
            handleSearch();
            fetchDiscoverUsers();

        } catch (err: any) {
            console.error(err.response?.data?.message || err.message);
        }
    };

    const acceptRequest = async (userId: string) => {
        try {
            await api.post('/users/accept-request', { requesterId: userId });
            handleSearch();
            fetchDiscoverUsers();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-violet-50/30 to-white pb-20 safe-area-inset">
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

                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                        <Input
                            placeholder="Find friends..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 bg-white border-gray-200 rounded-2xl text-sm focus:border-[#8B5CF6]"
                        />
                    </div>
                </div>
            </header>

            <div className="px-4 py-4 space-y-6 pb-safe">
                <AnimatePresence mode="wait">
                    {query ? (
                        <motion.div key="results" className="space-y-4">
                            <h2 className="text-lg font-black text-gray-900">Search Results</h2>

                            {results.map((u) => (
                                <UserCard
                                    key={u._id}
                                    user={u}
                                    onAction={handleAction}
                                    onAccept={acceptRequest}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div key="discover" className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2.5">
                                    <TrendingUp className="w-4 h-4 text-pink-500" />
                                    <h2 className="text-lg font-black text-gray-900">Suggested for you</h2>
                                </div>

                                {discoverUsers.map((u) => (
                                    <UserCard
                                        key={u._id}
                                        user={u}
                                        onAction={handleAction}
                                        onAccept={acceptRequest}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const UserCard = ({
    user,
    onAction,
    onAccept
}: {
    user: SearchResult;
    onAction: (u: SearchResult) => void;
    onAccept: (id: string) => void;
}) => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-between p-3 bg-white border rounded-2xl">
            <div
                className="flex items-center gap-3 cursor-pointer flex-1"
                onClick={() => navigate(`/profile/${user._id}`)}
            >
                <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                        {user?.name
                            ? user.name[0].toUpperCase()
                            : user.username[0].toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div>
                    <h3 className="font-bold text-sm">
                        {user.name || user.username}
                    </h3>
                </div>
            </div>

            {/* 🔥 SAME UI BUTTON — DIFFERENT LOGIC */}
            <div className="flex gap-2">
                {user.isPending ? (
                    <>
                        <Button size="icon" onClick={() => onAccept(user._id)}>
                            <Check className="w-4 h-4" />
                        </Button>
                        <Button size="icon" onClick={() => onAction(user)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </>
                ) : (
                    <Button size="icon" onClick={() => onAction(user)}>
                        {user.isFriend ? (
                            <Check className="w-4 h-4 text-green-500" />
                        ) : user.isSent ? (
                            <X className="w-4 h-4 text-red-500" />
                        ) : (
                            <UserPlus className="w-4 h-4" />
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default SearchPage;