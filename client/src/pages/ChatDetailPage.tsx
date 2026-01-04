import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatWindow from '@/components/ChatWindow';
import ChatSidebar from '@/components/ChatSidebar';
import api from '@/api/api';
import { socket } from '@/lib/socket';

export default function ChatDetailPage() {
    const { friendId } = useParams();
    const navigate = useNavigate();
    const [friend, setFriend] = useState<any>(null);
    const [friends, setFriends] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            const { data } = await api.get('/users/me');
            setFriends(data.friends || []);
            setPendingRequests(data.pendingRequests || []);

            // Set current friend from list or fetch if not found
            const current = data.friends.find((f: any) => f._id === friendId);
            if (current) {
                setFriend(current);
            } else {
                const res = await api.get(`/users/${friendId}`);
                setFriend(res.data);
            }
        } catch (err) {
            console.error(err);
            navigate('/');
        }
    };

    useEffect(() => {
        fetchData();

        socket.on('user-status-change', ({ userId, online }) => {
            setFriends(prev => prev.map((f: any) => (f._id === userId ? { ...f, online } : f)));
            if (friendId === userId) {
                setFriend((prev: any) => prev ? { ...prev, online } : prev);
            }
        });

        return () => {
            socket.off('user-status-change');
        };
    }, [friendId]);

    if (!friend) return null;

    return (
        <div className="flex-1 flex overflow-hidden bg-white">
            {/* Sidebar only visible on desktop here */}
            <div className="hidden md:flex shrink-0">
                <ChatSidebar
                    friends={friends}
                    pendingRequests={pendingRequests}
                    onSelectFriend={(f: any) => navigate(`/chat/${f._id}`)}
                    onRefresh={fetchData}
                    mobile={false}
                />
            </div>

            <div className="flex-1 overflow-hidden flex flex-col h-full bg-white relative z-[60] md:z-10 border-l border-slate-100">
                <ChatWindow
                    friend={friend}
                    onStartCall={() => navigate('/call', { state: { caller: friend, incoming: false } })}
                    onBack={() => navigate('/')}
                />
            </div>
        </div>
    );
}
