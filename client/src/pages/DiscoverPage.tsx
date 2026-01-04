import { useState, useEffect } from 'react';
import FriendManagement from '@/components/FriendManagement';
import api from '@/api/api';

export default function DiscoverPage() {
    const [pendingRequests, setPendingRequests] = useState([]);

    const fetchRequests = async () => {
        try {
            const { data } = await api.get('/users/requests');
            setPendingRequests(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    return (
        <div className="flex-1 overflow-hidden flex flex-col">
            <FriendManagement
                pendingRequests={pendingRequests}
                onRefresh={fetchRequests}
                showOnlyRequests={false}
            />
        </div>
    );
}
