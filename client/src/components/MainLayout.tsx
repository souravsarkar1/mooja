import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { MessageSquare, Users, Compass, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import CallModal from '@/components/CallModal';

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuthStore();
    const [incomingCall, setIncomingCall] = useState<any>(null);

    useEffect(() => {
        if (user?.id) {
            socket.connect();
            socket.emit('join', user.id);

            socket.on('incoming-call', (data) => {
                console.log("Global Incoming Call:", data);
                setIncomingCall(data);
            });

            socket.on('call-ended', () => {
                setIncomingCall(null);
            });
        }

        return () => {
            socket.off('incoming-call');
            socket.off('call-ended');
        };
    }, [user?.id]);

    const tabs = [
        { id: 'chats', icon: MessageSquare, label: 'Chats', path: '/' },
        { id: 'discover', icon: Compass, label: 'Discover', path: '/discover' },
        { id: 'requests', icon: Users, label: 'Requests', path: '/requests' },
        { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
    ];

    const activeTab = tabs.find(t => t.path === (location.pathname === '/' ? '/' : location.pathname))?.id || (location.pathname.startsWith('/chat/') ? 'chats' : 'chats');

    return (
        <div className="flex h-screen bg-white overflow-hidden flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-20 lg:w-64 flex-col bg-slate-900 border-r border-slate-800 p-4 shrink-0 transition-all duration-300">
                <div className="flex items-center gap-3 px-2 mb-8">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                        <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-white text-xl hidden lg:block tracking-tight">Mooja</span>
                </div>

                <div className="flex-1 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => navigate(tab.path)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <tab.icon className={`w-6 h-6 shrink-0 transition-transform ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="font-semibold hidden lg:block">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <Button
                    variant="ghost"
                    className="mt-auto text-slate-400 hover:text-red-400 hover:bg-red-400/10 justify-start px-3 gap-3"
                    onClick={logout}
                >
                    <LogOut className="w-6 h-6 shrink-0" />
                    <span className="font-semibold hidden lg:block">Logout</span>
                </Button>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative flex flex-col">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, x: 1 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 overflow-hidden flex flex-col"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>

                {/* Mobile Bottom Navigation */}
                <div className="md:hidden bg-white/80 backdrop-blur-xl border-t border-slate-100 flex items-center justify-around px-2 py-3 safe-bottom z-50">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => navigate(tab.path)}
                                className="flex flex-col items-center gap-1.5 relative min-w-[64px]"
                            >
                                <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400'}`}>
                                    <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-blue-600' : 'text-slate-400 opacity-60'}`}>
                                    {tab.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute -top-3 w-1 h-1 bg-blue-600 rounded-full"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </main>

            {incomingCall && (
                <CallModal
                    open={true}
                    onOpenChange={(open: boolean) => !open && setIncomingCall(null)}
                    caller={{ id: incomingCall.from, username: incomingCall.name, avatar: incomingCall.avatar }}
                    onAnswer={() => {
                        const callData = incomingCall;
                        setIncomingCall(null);
                        navigate('/call', {
                            state: {
                                caller: { id: callData.from, username: callData.name, avatar: callData.avatar },
                                incoming: true,
                                signal: callData.signal
                            }
                        });
                    }}
                    onDecline={() => {
                        socket.emit('end-call', { to: incomingCall.from });
                        setIncomingCall(null);
                    }}
                />
            )}
        </div>
    );
}
