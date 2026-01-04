import { useState, useEffect } from 'react';
import FriendManagement from '@/components/FriendManagement';
import api from '@/api/api';

export default function RequestsPage() {
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
        <div className="flex-1 overflow-hidden flex flex-col pt-4 md:pt-8 px-4 md:px-8 bg-slate-50/50">
            <div className="max-w-4xl mx-auto w-full">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Friend Requests</h1>
                <FriendManagement
                    pendingRequests={pendingRequests}
                    onRefresh={fetchRequests}
                    showOnlyRequests={true}
                />
            </div>
        </div>
    );
}
