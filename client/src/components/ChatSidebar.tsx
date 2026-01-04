import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserPlus, Bell, LogOut, Search } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/api/api';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';

export default function ChatSidebar({ friends, pendingRequests, onSelectFriend, onRefresh }: any) {
    const { user, logout } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            const { data } = await api.get(`/users/search?query=${searchQuery}`);
            setSearchResults(data);
        } catch (err) {
            console.error(err);
        }
    };

    const sendFriendRequest = async (recipientId: string) => {
        try {
            await api.post('/users/friend-request', { recipientId });
            alert('Request sent!');
            onRefresh();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to send request');
        }
    };

    const acceptRequest = async (requesterId: string) => {
        try {
            await api.post('/users/accept-request', { requesterId });
            onRefresh();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="w-80 border-r flex flex-col h-full bg-slate-50/50 hidden md:flex">
            <div className="p-4 border-b space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                            <AvatarImage src={user?.avatar} />
                            <AvatarFallback className="bg-blue-600 text-white font-bold">
                                {user?.username?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold truncate max-w-[100px] text-gray-800">{user?.username}</span>
                    </div>
                    <div className="flex gap-1">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative group">
                                    <Bell className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                                    {pendingRequests.length > 0 && (
                                        <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 h-4 min-w-4 flex items-center justify-center text-[10px]" variant="destructive">
                                            {pendingRequests.length}
                                        </Badge>
                                    )}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Friend Requests</DialogTitle>
                                    <DialogDescription className="sr-only">
                                        View and accept pending friend requests
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto pr-2">
                                    {pendingRequests.length === 0 && (
                                        <div className="text-center py-8">
                                            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                                            <p className="text-gray-500">No pending requests</p>
                                        </div>
                                    )}
                                    {pendingRequests.map((req: any) => (
                                        <div key={req._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                                                        {req.username[0].toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900">{req.username}</p>
                                                    <p className="text-xs text-gray-500">Sent a request</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8" onClick={() => acceptRequest(req._id)}>
                                                    Confirm
                                                </Button>
                                                <Button size="sm" variant="outline" className="h-8 border-gray-200">
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onSelectFriend(null)}
                            className="group"
                            title="Discover Friends"
                        >
                            <UserPlus className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={logout} className="group">
                            <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-600" />
                        </Button>
                    </div>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                        placeholder="Search users..."
                        className="pl-9 h-10 bg-white border-gray-200 focus:ring-2 focus:ring-blue-100 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>

                {searchResults.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xl space-y-3 mt-2 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">Search Results</span>
                            <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setSearchResults([])}>Clear</Button>
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                            {searchResults.map((u: any) => (
                                <div key={u._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-7 w-7">
                                            <AvatarFallback className="text-[10px] bg-gray-100 text-gray-600">
                                                {u.username[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium text-gray-800 truncate max-w-[100px]">{u.username}</span>
                                    </div>
                                    <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => sendFriendRequest(u._id)}>
                                        <UserPlus className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <ScrollArea className="flex-1">
                <div className="p-3 space-y-1">
                    <h3 className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Your Chats</h3>
                    {friends.length === 0 && (
                        <div className="text-center py-10 px-4">
                            <p className="text-[11px] text-gray-400 leading-relaxed">No active chats yet. Find friends to start chatting!</p>
                        </div>
                    )}
                    {friends.map((friend: any) => (
                        <button
                            key={friend._id}
                            onClick={() => onSelectFriend(friend)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 text-left group"
                        >
                            <div className="relative">
                                <Avatar className="h-11 w-11 ring-2 ring-white">
                                    <AvatarImage src={friend.avatar} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                                        {friend.username[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                {friend.online && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full ring-2 ring-green-100"></span>
                                )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{friend.username}</p>
                                <p className={`text-[10px] font-medium ${friend.online ? 'text-green-500' : 'text-gray-400'} transition-colors`}>
                                    {friend.online ? 'Online' : 'Offline'}
                                </p>
                            </div>
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
