import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/api/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, Lock, LogIn, MessageSquareQuote } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { setAuth, token } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (token) navigate('/');
    }, [token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            setAuth(data.user, data.token);
            navigate('/');
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden p-6">
            {/* Animated Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[420px] z-10"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-4 rotate-3 transform hover:rotate-0 transition-transform duration-300">
                        <MessageSquareQuote className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
                    <p className="text-slate-400 mt-2 text-center">Connect with your friends instantly</p>
                </div>

                <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-bold text-white text-center hidden">Login</CardTitle>
                        <CardDescription className="text-center text-slate-400 hidden">
                            Access your chat dashboard
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-300 text-sm font-medium">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        required
                                        className="pl-10 h-12 bg-slate-950/50 border-white/5 focus:border-blue-500/50 focus:ring-blue-500/20 text-white transition-all placeholder:text-slate-600"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-slate-300 text-sm font-medium">Password</Label>
                                    <button type="button" className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold uppercase tracking-widest">Forgot?</button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="pl-10 h-12 bg-slate-950/50 border-white/5 focus:border-blue-500/50 focus:ring-blue-500/20 text-white transition-all placeholder:text-slate-600"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col pt-4 gap-4">
                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    <>
                                        <LogIn className="w-4 h-4" />
                                        <span>Login to Account</span>
                                    </>
                                )}
                            </Button>

                            <div className="w-full flex items-center gap-4 py-2">
                                <div className="h-[1px] flex-1 bg-white/5"></div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">or continue with</span>
                                <div className="h-[1px] flex-1 bg-white/5"></div>
                            </div>

                            <p className="text-sm text-center text-slate-400">
                                New to the app?{' '}
                                <Link to="/signup" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
                                    Create account
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}
