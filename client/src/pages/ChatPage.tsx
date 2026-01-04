import { useState, useEffect } from 'react';
import ChatSidebar from '@/components/ChatSidebar';
import api from '@/api/api';
import { socket } from '@/lib/socket';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatPage() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [friends, setFriends] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            const { data } = await api.get('/users/me');
            setFriends(data.friends || []);
            setPendingRequests(data.pendingRequests || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (user?.id) {
            socket.emit('join', user.id);
            fetchData();
        }

        socket.on('user-status-change', ({ userId, online }) => {
            setFriends(prev =>
                prev.map((f: any) => (f._id === userId ? { ...f, online } : f))
            );
        });

        socket.on('receive-message', () => {
            // fetchData(); // Refresh if needed
        });

        return () => {
            socket.off('user-status-change');
            socket.off('receive-message');
        };
    }, [user?.id]);

    return (
        <div className="flex h-full bg-slate-50/50">
            {/* Sidebar always visible as the main list here */}
            <ChatSidebar
                friends={friends}
                pendingRequests={pendingRequests}
                onSelectFriend={(friend: any) => navigate(`/chat/${friend._id}`)}
                onRefresh={fetchData}
                mobile={true}
            />

            {/* Desktop Placeholder View */}
            <div className="hidden md:flex flex-1 items-center justify-center p-8 bg-white border-l border-slate-100">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6 max-w-sm"
                >
                    <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                        <MessageSquare className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Select a Chat</h2>
                        <p className="text-slate-500 leading-relaxed font-medium">Pick a conversation from the sidebar or discover new people to start messaging.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
