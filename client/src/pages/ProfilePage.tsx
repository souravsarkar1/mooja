import { useAuthStore } from '@/store/useAuthStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Mail, Shield, Bell, Settings, LogOut, ChevronRight, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
    const { user, logout } = useAuthStore();

    const sections = [
        { icon: Shield, label: 'Security', color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { icon: Bell, label: 'Notifications', color: 'text-orange-500', bg: 'bg-orange-50' },
        { icon: Settings, label: 'Preferences', color: 'text-blue-500', bg: 'bg-blue-50' },
    ];

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50/50">
            <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-8 pb-32">
                <header className="flex flex-col items-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-8 self-start hidden md:block">My Profile</h1>

                    <div className="relative group">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-32 h-32 md:w-40 md:h-40 rounded-full ring-4 ring-white shadow-2xl overflow-hidden"
                        >
                            <Avatar className="w-full h-full">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold">
                                    {user?.username?.[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </motion.div>
                        <button className="absolute bottom-1 right-1 bg-white p-2.5 rounded-full shadow-lg border border-slate-100 text-blue-600 hover:scale-110 active:scale-95 transition-all">
                            <Camera className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <h2 className="text-2xl font-bold text-slate-900">{user?.username}</h2>
                        <p className="text-slate-500 flex items-center justify-center gap-2 mt-1">
                            <Mail className="w-4 h-4" />
                            {user?.email}
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 border-slate-100 shadow-sm flex flex-col items-center text-center gap-2">
                        <span className="text-2xl font-bold text-blue-600">12</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Friends</span>
                    </Card>
                    <Card className="p-4 border-slate-100 shadow-sm flex flex-col items-center text-center gap-2">
                        <span className="text-2xl font-bold text-blue-600">458</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Messages</span>
                    </Card>
                </div>

                <div className="space-y-3">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">Account & Safety</h3>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        {sections.map((item, idx) => (
                            <button
                                key={item.label}
                                className={`w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors ${idx !== sections.length - 1 ? 'border-b border-slate-50' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`${item.bg} ${item.color} p-2.5 rounded-xl`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-semibold text-slate-800">{item.label}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">Actions</h3>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-4 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 hover:bg-red-100 transition-all font-bold group"
                    >
                        <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        Sign Out of Session
                    </button>
                </div>

                <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-4">
                    Mooja Chat v1.0.4
                </p>
            </div>
        </div>
    );
}
