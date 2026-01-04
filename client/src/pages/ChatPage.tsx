import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { socket } from '@/lib/socket';
import api from '@/api/api';
import ChatSidebar from '@/components/ChatSidebar';
import ChatWindow from '@/components/ChatWindow';
import CallModal from '@/components/CallModal';
import FriendManagement from '@/components/FriendManagement';
import { useNavigate } from 'react-router-dom';

export default function ChatPage() {
    const { user, token, logout } = useAuthStore();
    const [selectedFriend, setSelectedFriend] = useState<any>(null);
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [incomingCall, setIncomingCall] = useState<any>(null);
    const [isCalling, setIsCalling] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token || !user) {
            navigate('/login');
            return;
        }

        // Connect socket
        socket.connect();
        socket.emit('join', user.id);

        // Fetch initial data
        fetchUserData();

        socket.on('user-status-change', (data: { userId: string, online: boolean }) => {
            setFriends((prev: any) => prev.map((f: any) =>
                f._id === data.userId ? { ...f, online: data.online } : f
            ));
            if (selectedFriend?._id === data.userId) {
                setSelectedFriend((prev: any) => ({ ...prev, online: data.online }));
            }
        });

        socket.on('receive-message', (message) => {
            // If message is from a new friend request accepted, we might want to refresh
            if (message.type === 'system') fetchUserData();
        });

        socket.on('incoming-call', (data) => {
            console.log("INCOMING CALL RECEIVED:", data);
            setIncomingCall(data);
        });

        socket.on('call-ended', () => {
            setIncomingCall(null);
            setIsCalling(false);
        });

        return () => {
            socket.off('user-status-change');
            socket.off('receive-message');
            socket.off('incoming-call');
            socket.off('call-ended');
            socket.disconnect();
        };
    }, [token, user]);

    const fetchUserData = async () => {
        try {
            const { data } = await api.get('/users/me');
            setFriends(data.friends);
            setPendingRequests(data.pendingRequests);
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 401) logout();
        }
    };

    return (
        <div className="flex h-screen w-full bg-white overflow-hidden">
            <ChatSidebar
                friends={friends}
                pendingRequests={pendingRequests}
                onSelectFriend={setSelectedFriend}
                onRefresh={fetchUserData}
            />
            <div className="flex-1 flex flex-col min-w-0">
                {selectedFriend ? (
                    <ChatWindow
                        friend={selectedFriend}
                        onStartCall={() => setIsCalling(true)}
                        onBack={() => setSelectedFriend(null)}
                    />
                ) : (
                    <FriendManagement
                        pendingRequests={pendingRequests}
                        onRefresh={fetchUserData}
                    />
                )}
            </div>

            <CallModal
                open={isCalling || !!incomingCall}
                onOpenChange={(open: boolean) => {
                    if (!open) {
                        setIsCalling(false);
                        setIncomingCall(null);
                    }
                }}
                caller={incomingCall ? { id: incomingCall.from, username: incomingCall.name } : selectedFriend}
                incoming={!!incomingCall}
                signal={incomingCall?.signal}
            />
        </div>
    );
}
