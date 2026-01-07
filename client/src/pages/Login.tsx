import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/api/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const setAuth = useAuthStore((state) => state.setAuth);
    const navigate = useNavigate();
    const { user, token } = useAuthStore((state) => state)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            setAuth(data.user, data.token);
            toast.success('Login successful');
            navigate('/');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && token) {
            navigate('/', { replace: true });
        }
    }, [user, token, navigate]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-100 rounded-full blur-[120px] opacity-60" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-100 rounded-full blur-[120px] opacity-60" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="border-gray-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl">
                    <CardHeader className="space-y-4 pt-10 pb-6 px-8">
                        <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-2xl shadow-xl shadow-violet-200 flex items-center justify-center mx-auto mb-2 transform rotate-3">
                            <span className="text-white text-3xl font-black italic">M</span>
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-3xl font-black text-center text-gray-900 tracking-tight">Welcome Back</CardTitle>
                            <CardDescription className="text-center font-medium text-gray-500">
                                Enter your credentials to dive back in
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-5 px-8">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-bold text-gray-700 ml-1">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-violet-100 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <Label htmlFor="password" text-gray-700 font-bold>Password</Label>
                                    <Link to="#" className="text-xs font-bold text-violet-600 hover:text-violet-700">Forgot?</Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-violet-100 transition-all font-medium"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 pt-6 pb-10 px-8">
                            <Button
                                type="submit"
                                className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold shadow-lg shadow-violet-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Checking...
                                    </div>
                                ) : 'Sign In'}
                            </Button>
                            <p className="text-sm text-center text-gray-500 font-medium">
                                New here?{' '}
                                <Link to="/signup" className="text-violet-600 font-bold hover:text-violet-700 transition-colors">
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
