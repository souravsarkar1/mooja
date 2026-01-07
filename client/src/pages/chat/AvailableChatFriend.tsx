import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/api/api';
import { socket } from '@/lib/socket';
import {
    Search,
    UserPlus,
    Bell,
    Sparkles,
    MessageCircle,
    Check,
    CheckCheck,
} from 'lucide-react';

interface Friend {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    online: boolean;
    lastMessage?: {
        content: string;
        createdAt: string;
        sender: string;
        read: boolean;
    };
    unreadCount?: number;
}

interface PendingRequest {
    _id: string;
    username: string;
    email: string;
}

const AvailableChatFriend = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();

        // Connect socket if not connected
        if (user?.id) {
            socket.connect();
            socket.emit('join', user.id);
        }

        // Listen for real-time updates
        socket.on('user-status-change', (data: { userId: string; online: boolean }) => {
            setFriends((prev) =>
                prev.map((f) => (f._id === data.userId ? { ...f, online: data.online } : f))
            );
        });

        socket.on('receive-message', () => {
            // Refresh to update last message
            fetchUserData();
        });

        return () => {
            socket.off('user-status-change');
            socket.off('receive-message');
        };
    }, [user?.id]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users/me');

            // Fetch last messages for each friend
            const friendsWithMessages = await Promise.all(
                data.friends.map(async (friend: Friend) => {
                    try {
                        const messagesRes = await api.get(`/chat/${friend._id}?limit=1`);
                        const messages = messagesRes.data;
                        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

                        // Count unread messages
                        const unreadCount = messages.filter(
                            (m: any) => m.sender === friend._id && !m.read
                        ).length;

                        return {
                            ...friend,
                            lastMessage,
                            unreadCount,
                        };
                    } catch {
                        return friend;
                    }
                })
            );

            // Sort by last message time
            friendsWithMessages.sort((a, b) => {
                if (!a.lastMessage?.createdAt) return 1;
                if (!b.lastMessage?.createdAt) return -1;
                return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
            });

            setFriends(friendsWithMessages);
            setPendingRequests(data.pendingRequests);
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const acceptRequest = async (requesterId: string) => {
        try {
            await api.post('/users/accept-request', { requesterId });
            fetchUserData();
        } catch (err) {
            console.error(err);
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const filteredFriends = friends.filter((friend) =>
        friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-gray-100/50">
                <div className="max-w-lg mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                                Messages
                            </h1>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {friends.filter((f) => f.online).length} friends online
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full hover:bg-violet-50 relative"
                                onClick={() => navigate('/search')}
                            >
                                <UserPlus className="w-5 h-5 text-gray-700" />
                            </Button>
                            {pendingRequests.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full hover:bg-violet-50 relative"
                                >
                                    <Bell className="w-5 h-5 text-gray-700" />
                                    <Badge className="absolute -top-1 -right-1 h-5 min-w-5 p-0 flex items-center justify-center text-[10px] bg-gradient-to-r from-pink-500 to-violet-500 border-0">
                                        {pendingRequests.length}
                                    </Badge>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search conversations..."
                            className="pl-10 h-11 bg-gray-50/80 border-gray-100 rounded-2xl focus:ring-2 focus:ring-violet-100 focus:border-violet-300 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {/* Online Friends Horizontal Scroll */}
            {friends.filter((f) => f.online).length > 0 && (
                <div className="max-w-lg mx-auto px-4 py-4">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Active Now
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {friends
                            .filter((f) => f.online)
                            .map((friend) => (
                                <button
                                    key={friend._id}
                                    onClick={() => navigate(`/chat/${friend._id}`)}
                                    className="flex flex-col items-center gap-1.5 min-w-fit group"
                                >
                                    <div className="relative">
                                        <div className="p-[2px] rounded-full bg-gradient-to-br from-green-400 to-emerald-500">
                                            <Avatar className="h-14 w-14 border-2 border-white">
                                                <AvatarImage src={friend.avatar} />
                                                <AvatarFallback className="bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-600 font-semibold">
                                                    {friend.username[0].toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                                    </div>
                                    <span className="text-[11px] font-medium text-gray-600 group-hover:text-violet-600 transition-colors truncate max-w-[60px]">
                                        {friend.username}
                                    </span>
                                </button>
                            ))}
                    </div>
                </div>
            )}

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <div className="max-w-lg mx-auto px-4 mb-4">
                    <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-2xl p-4 border border-violet-100/50">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-violet-500" />
                            <h2 className="text-sm font-semibold text-violet-900">
                                Friend Requests ({pendingRequests.length})
                            </h2>
                        </div>
                        <div className="space-y-2">
                            {pendingRequests.slice(0, 2).map((req) => (
                                <div
                                    key={req._id}
                                    className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-gradient-to-br from-violet-200 to-fuchsia-200 text-violet-600 font-semibold">
                                                {req.username[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900">{req.username}</p>
                                            <p className="text-xs text-gray-500">Wants to connect</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-xl h-8 px-4"
                                        onClick={() => acceptRequest(req._id)}
                                    >
                                        Accept
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Chat List */}
            <ScrollArea className="max-w-lg mx-auto">
                <div className="px-4 space-y-1">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                        Recent Chats
                    </h2>

                    {loading ? (
                        // Loading skeletons
                        <div className="space-y-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                                    <div className="w-14 h-14 rounded-full bg-gray-200"></div>
                                    <div className="flex-1">
                                        <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-3 w-40 bg-gray-100 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredFriends.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 mb-4">
                                <MessageCircle className="w-10 h-10 text-violet-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">No conversations yet</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Start by adding friends to chat with
                            </p>
                            <Button
                                onClick={() => navigate('/search')}
                                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-2xl"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Find Friends
                            </Button>
                        </div>
                    ) : (
                        filteredFriends.map((friend) => (
                            <button
                                key={friend._id}
                                onClick={() => navigate(`/chat/${friend._id}`)}
                                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-200 text-left group"
                            >
                                <div className="relative">
                                    <Avatar className="h-14 w-14 ring-2 ring-gray-100 group-hover:ring-violet-100 transition-all">
                                        <AvatarImage src={friend.avatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-600 font-semibold text-lg">
                                            {friend.username[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    {friend.online && (
                                        <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors truncate">
                                            {friend.username}
                                        </span>
                                        {friend.lastMessage && (
                                            <span className="text-[11px] text-gray-400 ml-2 flex-shrink-0">
                                                {formatTime(friend.lastMessage.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {friend.lastMessage && friend.lastMessage.sender === user?.id && (
                                            <span className="flex-shrink-0">
                                                {friend.lastMessage.read ? (
                                                    <CheckCheck className="w-4 h-4 text-violet-500" />
                                                ) : (
                                                    <Check className="w-4 h-4 text-gray-400" />
                                                )}
                                            </span>
                                        )}
                                        <p className="text-sm text-gray-500 truncate max-w-[200px]">
                                            {friend.lastMessage?.content || 'Start a conversation'}
                                        </p>
                                    </div>
                                </div>

                                {friend.unreadCount && friend.unreadCount > 0 && (
                                    <div className="flex-shrink-0">
                                        <Badge className="h-6 min-w-6 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-violet-500 to-fuchsia-500 border-0">
                                            {friend.unreadCount}
                                        </Badge>
                                    </div>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </ScrollArea>

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

export default AvailableChatFriend;