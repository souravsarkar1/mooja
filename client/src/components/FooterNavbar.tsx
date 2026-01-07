import { useAuthStore } from '@/store/useAuthStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Film, Home, MessageCircle, Search, User } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const FooterNavbar = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const isChatPage = location.pathname.startsWith('/chat/') && location.pathname !== '/chat';

    const getActiveTab = () => {
        const path = location.pathname;
        if (path === '/') return 'home';
        if (path.startsWith('/search')) return 'search';
        if (path.startsWith('/reels')) return 'reels';
        if (path.startsWith('/chat')) return 'messages';
        if (path.startsWith('/profile')) return 'profile';
        return 'home';
    };

    const activeTab = getActiveTab();

    const handleTabChange = (tab: string) => {
        const paths: Record<string, string> = {
            home: '/',
            search: '/search',
            reels: '/reels',
            messages: '/chat',
            profile: '/profile'
        };
        navigate(paths[tab]);
    };

    if (isChatPage) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100/50 z-50">
            <div className="max-w-lg mx-auto px-6 h-16 flex items-center justify-between">
                <button
                    onClick={() => handleTabChange('home')}
                    className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${activeTab === 'home' ? 'text-violet-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Home className={`w-6 h-6 ${activeTab === 'home' ? 'fill-violet-100' : ''}`} />
                    {activeTab === 'home' && <span className="w-1 h-1 rounded-full bg-violet-600 animate-pulse"></span>}
                </button>
                <button
                    onClick={() => handleTabChange('search')}
                    className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${activeTab === 'search' ? 'text-violet-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Search className="w-6 h-6" />
                    {activeTab === 'search' && <span className="w-1 h-1 rounded-full bg-violet-600 animate-pulse"></span>}
                </button>
                <button
                    onClick={() => handleTabChange('reels')}
                    className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${activeTab === 'reels' ? 'text-violet-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Film className="w-6 h-6" />
                    {activeTab === 'reels' && <span className="w-1 h-1 rounded-full bg-violet-600 animate-pulse"></span>}
                </button>
                <button
                    onClick={() => handleTabChange('messages')}
                    className={`flex flex-col items-center gap-0.5 transition-all duration-300 relative ${activeTab === 'messages' ? 'text-violet-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <MessageCircle className={`w-6 h-6 ${activeTab === 'messages' ? 'fill-violet-100' : ''}`} />
                    <span className="absolute -top-0.5 right-0 w-2 h-2 bg-pink-500 rounded-full border border-white"></span>
                    {activeTab === 'messages' && <span className="w-1 h-1 rounded-full bg-violet-600 animate-pulse"></span>}
                </button>
                <button
                    onClick={() => handleTabChange('profile')}
                    className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${activeTab === 'profile' ? 'scale-110' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <div className={`p-[1.5px] rounded-full transition-all ${activeTab === 'profile' ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-transparent'}`}>
                        <div className="bg-white rounded-full p-[1px]">
                            <Avatar className="h-7 w-7">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback className="text-[10px] bg-gray-100 text-gray-600 flex items-center justify-center">
                                    {user?.username?.[0]?.toUpperCase() || <User className="w-3 h-3" />}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                    {activeTab === 'profile' && <span className="w-1 h-1 rounded-full bg-violet-600 animate-pulse"></span>}
                </button>
            </div>
        </nav>
    )
}

export default FooterNavbar