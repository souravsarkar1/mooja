import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { socket } from '@/lib/socket';
import api from '@/api/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import CallModal from '@/components/CallModal';
import {
    ArrowLeft,
    Phone,
    Video,
    MoreVertical,
    Send,
    Smile,
    Image,
    Sparkles,
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
interface Message {
    _id: string;
    sender: string;
    receiver: string;
    content: string;
    type: 'text' | 'audio' | 'video';
    read: boolean;
    createdAt: string;
}

interface Friend {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    online: boolean;
}

export default function ChatPage() {
    const { id: friendId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, token, logout } = useAuthStore();

    const [friend, setFriend] = useState<Friend | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [incomingCall, setIncomingCall] = useState<any>(null);
    const [isCalling, setIsCalling] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<any>(null);

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const picker = document.getElementById('emoji-picker-container');
            const toggle = document.getElementById('emoji-toggle-button');
            if (picker && !picker.contains(event.target as Node) && toggle && !toggle.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const onEmojiClick = (emojiData: any) => {
        setNewMessage((prev) => prev + emojiData.emoji);
    };

    useEffect(() => {
        if (!token || !user) {
            navigate('/login');
            return;
        }

        if (!friendId) {
            navigate('/chat');
            return;
        }

        // Connect socket
        socket.connect();
        socket.emit('join', user.id);

        // Fetch friend data and messages
        fetchFriendData();
        fetchMessages();

        // Socket listeners
        socket.on('receive-message', (message: Message) => {
            if (message.sender === friendId || message.receiver === friendId) {
                setMessages((prev) => [...prev, message]);
                // Mark as read if from friend
                if (message.sender === friendId) {
                    markMessagesAsRead();
                }
            }
        });

        socket.on('user-status-change', (data: { userId: string; online: boolean }) => {
            if (data.userId === friendId) {
                setFriend((prev) => (prev ? { ...prev, online: data.online } : null));
            }
        });

        socket.on('user-typing', (data: { senderId: string }) => {
            if (data.senderId === friendId) setIsTyping(true);
        });

        socket.on('user-stop-typing', (data: { senderId: string }) => {
            if (data.senderId === friendId) setIsTyping(false);
        });

        socket.on('incoming-call', (data) => {
            console.log('INCOMING CALL RECEIVED:', data);
            setIncomingCall(data);
        });

        socket.on('call-ended', () => {
            setIncomingCall(null);
            setIsCalling(false);
        });

        return () => {
            socket.off('receive-message');
            socket.off('user-status-change');
            socket.off('user-typing');
            socket.off('user-stop-typing');
            socket.off('incoming-call');
            socket.off('call-ended');
        };
    }, [token, user, friendId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const fetchFriendData = async () => {
        try {
            const { data } = await api.get(`/users/${friendId}`);
            setFriend(data);
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 401) logout();
            if (err.response?.status === 404) navigate('/chat');
        }
    };

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/chat/${friendId}`);
            setMessages(data);
            markMessagesAsRead();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const markMessagesAsRead = async () => {
        try {
            await api.patch(`/chat/${friendId}/read`);
        } catch (err) {
            // Silent fail for read status
        }
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
        socket.emit('typing', { senderId: user?.id, receiverId: friendId });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop-typing', { senderId: user?.id, receiverId: friendId });
        }, 2000);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            sender: user?.id,
            receiver: friendId,
            content: newMessage,
            type: 'text',
        };

        socket.emit('send-message', messageData);
        socket.emit('stop-typing', { senderId: user?.id, receiverId: friendId });
        setNewMessage('');
    };

    const formatTime = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDateSeparator = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
        }
    };

    const shouldShowDateSeparator = (currentMsg: Message, prevMsg?: Message) => {
        if (!prevMsg) return true;
        const currentDate = new Date(currentMsg.createdAt).toDateString();
        const prevDate = new Date(prevMsg.createdAt).toDateString();
        return currentDate !== prevDate;
    };

    if (!friend) {
        return (
            <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-violet-50 items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-sm font-medium text-gray-500">Loading your conversation...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-violet-50 overflow-hidden">
            {/* Chat Header */}
            <header className="flex-none backdrop-blur-xl bg-white/90 border-b border-gray-100/50 shadow-sm z-50">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-violet-50 h-9 w-9"
                            onClick={() => navigate('/chat')}
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </Button>

                        <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => navigate(`/profile/${friend._id}`)}
                        >
                            <div className="relative">
                                <div className={`p-[1.5px] rounded-full ${friend.online ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gray-200'}`}>
                                    <Avatar className="h-10 w-10 border-2 border-white">
                                        <AvatarImage src={friend.avatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-600 font-semibold text-xs">
                                            {friend.username[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                {friend.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5 leading-none mb-1">
                                    <h2 className="font-bold text-gray-900 text-sm">{friend.username}</h2>
                                    <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                                </div>
                                <p className={`text-[10px] font-bold ${friend.online ? 'text-green-500' : 'text-gray-400'}`}>
                                    {friend.online ? 'Active now' : 'Offline'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-0.5 sm:gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-violet-50 text-gray-600 hover:text-violet-600 h-9 w-9"
                            onClick={() => setIsCalling(true)}
                        >
                            <Phone className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-violet-50 text-gray-600 hover:text-violet-600 h-9 w-9"
                            onClick={() => setIsCalling(true)}
                        >
                            <Video className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 text-gray-600 h-9 w-9">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Messages Area */}
            <ScrollArea className="flex-1 px-4">
                <div className="max-w-2xl mx-auto py-6 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin w-6 h-6 border-3 border-violet-500 border-t-transparent rounded-full"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 mb-4 opacity-50">
                                <Avatar className="h-14 w-14">
                                    <AvatarFallback className="bg-gradient-to-br from-violet-200 to-fuchsia-200 text-violet-600 font-bold text-xl">
                                        {friend.username[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{friend.username}</h3>
                            <p className="text-sm text-gray-500 mb-4">No messages yet. Say hi! 👋</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const isMe = msg.sender === user?.id;
                            const showDate = shouldShowDateSeparator(msg, messages[i - 1]);

                            return (
                                <div key={msg._id || i} className="space-y-4">
                                    {showDate && (
                                        <div className="flex justify-center my-8">
                                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100/50 px-3 py-1 rounded-full uppercase tracking-widest">
                                                {formatDateSeparator(msg.createdAt)}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} group items-end gap-2`}>
                                        {!isMe && (
                                            <Avatar className="h-6 w-6 mb-1 flex-none opacity-0 group-hover:opacity-100 transition-opacity">
                                                <AvatarImage src={friend.avatar} />
                                                <AvatarFallback className="text-[8px] bg-violet-100 text-violet-600">{friend.username[0]}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={`relative max-w-[80%] md:max-w-[70%] transform transition-all duration-200 hover:scale-[1.01]`}>
                                            <div
                                                className={`p-3 px-4 rounded-2xl shadow-sm text-sm leading-relaxed ${isMe
                                                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white rounded-br-none shadow-violet-100'
                                                    : 'bg-white text-gray-800 rounded-tl-md border border-gray-100'
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>
                                            <span
                                                className={`absolute -bottom-4 text-[9px] font-medium text-gray-400 opacity-0 group-hover:opacity-100 transition-all ${isMe ? 'right-0' : 'left-0'
                                                    }`}
                                            >
                                                {formatTime(msg.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start animate-in fade-in slide-in-from-bottom-1 duration-300">
                            <div className="bg-white border border-gray-100 p-2.5 px-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center">
                                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} className="h-2" />
                </div>
            </ScrollArea>

            {/* Message Input Container - Sits perfectly at bottom since footer is hidden */}
            <div className="flex-none bg-white/95 backdrop-blur-xl border-t border-gray-100/50 px-4 py-3 z-50">
                <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto flex items-center gap-2">
                    <div className="flex items-center">
                        <Button type="button" variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-violet-600 hover:bg-violet-50 h-10 w-10">
                            <Image className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="flex-1 relative">
                        <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={handleTyping}
                            className="w-full rounded-2xl pl-4 pr-10 h-11 bg-gray-50/80 border-transparent focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-100/50 transition-all text-sm"
                        />
                        <button
                            type="button"
                            id="emoji-toggle-button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${showEmojiPicker ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'}`}
                        >
                            <Smile className="w-5 h-5" />
                        </button>

                        {showEmojiPicker && (
                            <div id="emoji-picker-container" className="absolute bottom-full right-0 mb-3 shadow-2xl animate-in zoom-in-95 duration-200 origin-bottom-right z-[100]">
                                <EmojiPicker
                                    onEmojiClick={onEmojiClick}
                                    autoFocusSearch={false}
                                    theme={'light' as any}
                                    width={320}
                                    height={400}
                                    previewConfig={{ showPreview: false }}
                                    skinTonesDisabled
                                />
                            </div>
                        )}
                    </div>

                    <Button
                        type="submit"
                        size="icon"
                        disabled={!newMessage.trim()}
                        className="rounded-xl h-11 w-11 bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 shadow-lg shadow-violet-200 hover:scale-105 active:scale-95 transition-all flex-none disabled:opacity-50"
                    >
                        <Send className="w-5 h-5 text-white" />
                    </Button>
                </form>
            </div>

            {/* Call Modal */}
            <CallModal
                open={isCalling || !!incomingCall}
                onOpenChange={(open: boolean) => {
                    if (!open) {
                        setIsCalling(false);
                        setIncomingCall(null);
                    }
                }}
                caller={incomingCall ? { id: incomingCall.from, username: incomingCall.name } : friend}
                incoming={!!incomingCall}
                signal={incomingCall?.signal}
            />
        </div>
    );
}
