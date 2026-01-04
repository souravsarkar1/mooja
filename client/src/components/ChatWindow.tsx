import { useState, useEffect, useRef } from 'react';
import { Phone, Video, Send, MoreVertical, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { socket } from '@/lib/socket';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/api/api';

export default function ChatWindow({ friend, onStartCall, onBack }: any) {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<any>(null);

    useEffect(() => {
        fetchMessages();

        socket.on('receive-message', (message: any) => {
            if (message.sender === friend._id || message.receiver === friend._id) {
                setMessages((prev) => [...prev, message]);
            }
        });

        socket.on('user-typing', (data: { senderId: string }) => {
            if (data.senderId === friend._id) setIsTyping(true);
        });

        socket.on('user-stop-typing', (data: { senderId: string }) => {
            if (data.senderId === friend._id) setIsTyping(false);
        });

        return () => {
            socket.off('receive-message');
            socket.off('user-typing');
            socket.off('user-stop-typing');
        };
    }, [friend._id]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const fetchMessages = async () => {
        try {
            const { data } = await api.get(`/chat/${friend._id}`);
            setMessages(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        socket.emit('typing', { senderId: user?.id, receiverId: friend._id });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop-typing', { senderId: user?.id, receiverId: friend._id });
        }, 2000);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            sender: user?.id,
            receiver: friend._id,
            content: newMessage,
            type: 'text',
        };

        socket.emit('send-message', messageData);
        socket.emit('stop-typing', { senderId: user?.id, receiverId: friend._id });
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-full bg-white animate-in fade-in duration-300">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-white shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="relative">
                        <Avatar className="h-10 w-10 ring-2 ring-blue-50">
                            <AvatarImage src={friend.avatar} />
                            <AvatarFallback>{friend.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {friend.online && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900">{friend.username}</h2>
                        <p className={`text-[10px] font-medium ${friend.online ? 'text-green-500' : 'text-gray-400'}`}>
                            {friend.online ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={onStartCall}>
                        <Phone className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={onStartCall}>
                        <Video className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900">
                        <MoreVertical className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-gray-50/30">
                <div className="space-y-4 max-w-4xl mx-auto">
                    {messages.map((msg, i) => {
                        const isMe = msg.sender === user?.id;
                        return (
                            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`group relative max-w-[75%] md:max-w-[65%] p-3 px-4 rounded-2xl shadow-sm text-sm leading-relaxed transition-all ${isMe
                                    ? 'bg-blue-600 text-white rounded-tr-none hover:bg-blue-700'
                                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 hover:border-blue-100'
                                    }`}>
                                    {msg.content}
                                    <span className={`absolute bottom-[-18px] text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'right-0' : 'left-0'}`}>
                                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    {isTyping && (
                        <div className="flex justify-start animate-in fade-in slide-in-from-bottom-1 duration-300">
                            <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                <span className="text-[10px] text-gray-400 ml-1 font-medium italic">Typing...</span>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} className="h-4" />
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t bg-white/80 backdrop-blur-sm">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-2 items-center">
                    <div className="flex-1 relative">
                        <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={handleTyping}
                            className="w-full rounded-2xl px-5 h-11 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all text-sm pr-12 bg-gray-50/50"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                        >
                            {/* Smiley/Media icon placeholder */}
                        </button>
                    </div>
                    <Button type="submit" size="icon" className="rounded-xl h-11 w-11 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all">
                        <Send className="w-5 h-5 text-white" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
