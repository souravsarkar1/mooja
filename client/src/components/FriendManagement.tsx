import { useState, useEffect } from 'react';
import api from '@/api/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserPlus, Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function FriendManagement({ pendingRequests, onRefresh, showOnlyRequests }: any) {
    const [suggestions, setSuggestions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!showOnlyRequests) {
            fetchSuggestions();
        }
    }, [showOnlyRequests]);

    const fetchSuggestions = async () => {
        try {
            const { data } = await api.get('/users/discover');
            setSuggestions(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/users/search?query=${searchQuery}`);
            setSearchResults(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const sendRequest = async (id: string) => {
        try {
            await api.post('/users/friend-request', { recipientId: id });
            setSuggestions(prev => prev.filter((u: any) => u._id !== id));
            setSearchResults(prev => prev.filter((u: any) => u._id !== id));
            alert('Request sent!');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error sending request');
        }
    };

    const acceptRequest = async (id: string) => {
        try {
            await api.post('/users/accept-request', { requesterId: id });
            onRefresh();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={`flex-1 overflow-hidden flex flex-col ${showOnlyRequests ? '' : 'bg-gray-50/50 p-4 md:p-8'}`}>
            <div className="max-w-4xl mx-auto w-full space-y-8">
                {/* Search Header - Only if not showing just requests */}
                {!showOnlyRequests && (
                    <div className="flex flex-col gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">Find Friends</h1>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by username..."
                                    className="pl-10 h-11 bg-white rounded-xl shadow-sm border-gray-100"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button type="submit" size="lg" disabled={loading} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6">
                                Search
                            </Button>
                        </form>
                    </div>
                )}

                <div className={`grid grid-cols-1 ${showOnlyRequests ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-8 h-full`}>
                    {/* Pending Requests Column */}
                    {(showOnlyRequests || !showOnlyRequests) && (
                        <div className="space-y-4">
                            {!showOnlyRequests && (
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        Friend Requests
                                        {pendingRequests.length > 0 && (
                                            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">
                                                {pendingRequests.length}
                                            </span>
                                        )}
                                    </h2>
                                </div>
                            )}
                            <ScrollArea className={`${showOnlyRequests ? 'h-full' : 'h-[400px]'} rounded-2xl border bg-white shadow-sm p-4`}>
                                {pendingRequests.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500 py-12">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <Bell className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="font-medium">No new requests</p>
                                    </div>
                                )}
                                <div className="space-y-4">
                                    {pendingRequests.map((req: any) => (
                                        <div key={req._id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 group hover:border-blue-200 hover:bg-blue-50/10 transition-all">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-12 w-12 ring-4 ring-white shadow-sm">
                                                    <AvatarImage src={req.avatar} />
                                                    <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                                                        {req.username[0].toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-gray-900 leading-none">{req.username}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">Pending Approval</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-lg h-9 px-4 shadow-lg shadow-blue-100" onClick={() => acceptRequest(req._id)}>
                                                    Confirm
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg h-9">
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}

                    {/* Discover People Column - Hidden if only requests */}
                    {!showOnlyRequests && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">People You May Know</h2>
                            <ScrollArea className="h-[400px] rounded-2xl border bg-white shadow-sm p-4">
                                <div className="space-y-4">
                                    {(searchResults.length > 0 ? searchResults : suggestions).map((u: any) => (
                                        <div key={u._id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/10 transition-all">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 ring-2 ring-white">
                                                    <AvatarImage src={u.avatar} />
                                                    <AvatarFallback className="bg-gray-100 text-gray-600">
                                                        {u.username[0].toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{u.username}</p>
                                                    <p className="text-[10px] text-gray-400">Software Engineer</p>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="gap-2 h-9 px-4 text-blue-600 bg-blue-50/50 hover:bg-blue-100 border-none rounded-lg font-semibold transition-all"
                                                onClick={() => sendRequest(u._id)}
                                            >
                                                <UserPlus className="h-4 w-4" />
                                                Add
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
