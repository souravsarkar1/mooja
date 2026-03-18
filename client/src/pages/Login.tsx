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
import { analytics, auth } from '../firebase';
import { GithubAuthProvider, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { logEvent } from 'firebase/analytics';

export default function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const setAuth = useAuthStore((state) => state.setAuth);
    const { user, token } = useAuthStore((state) => state)

    const navigate = useNavigate();

    useEffect(() => {
        if (user && token) {
            navigate('/', { replace: true });
        }
    }, [user, token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await api.post('/auth/login', { email, password });

            setAuth(data.user, data.token);

            logEvent(analytics, "email_password_login_done", { platform: "web" })

            toast.success('Login successful');
            navigate('/');

        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed');
            logEvent(analytics, "email_password_login_failed", { platform: "web" })
        } finally {
            setLoading(false);
        }
    };

    const provider = new GoogleAuthProvider();

    const loginWithGoogle = async () => {
        try {

            const result = await signInWithPopup(auth, provider);

            const user = result.user;
console.log(user);
            const res = await api.post("/auth/google-auth", user);

            setAuth(res.data.user, res.data.token);

            toast.success('Login successful');
            logEvent(analytics, "google_auth_done", { platform: "web" })
            navigate("/");

        } catch (error) {
            console.error(error);
            logEvent(analytics, "google_auth_failed", { platform: "web" })


        }
    };

    // const faceBookProvider = new FacebookAuthProvider();

    // const loginwithFacebook = async () => {
    //     try {

    //         const result = await signInWithPopup(auth, faceBookProvider);

    //         const user = result.user;

    //         const res = await api.post("/auth/facebook-auth", user);

    //         setAuth(res.data.user, res.data.token);

    //         toast.success('Login successful');

    //         navigate("/");

    //     } catch (error) {
    //         console.error(error);
    //     }
    // }

    const githubProvider = new GithubAuthProvider();

    const loginwithGithub = async () => {
        try {

            const result = await signInWithPopup(auth, githubProvider);

            const user = result.user;

            const res = await api.post("/auth/github-auth", user);

            setAuth(res.data.user, res.data.token);

            toast.success('Login successful');
            logEvent(analytics, "github_auth_done", { platform: "web" })

            navigate("/");

        } catch (error) {
            console.error(error, "line 113");
            logEvent(analytics, "github_auth_failed", { platform: "web" })

        }
    }

    return (

        <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">

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

                            <CardTitle className="text-3xl font-black text-center text-gray-900 tracking-tight">
                                Welcome Back
                            </CardTitle>

                            <CardDescription className="text-center font-medium text-gray-500">
                                Enter your credentials to dive back in
                            </CardDescription>

                        </div>

                    </CardHeader>

                    <form onSubmit={handleSubmit}>

                        <CardContent className="space-y-5 px-8">

                            <div className="space-y-2">

                                <Label htmlFor="email" className="font-bold text-gray-700 ml-1">
                                    Email address
                                </Label>

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

                                    <Label htmlFor="password" className="text-gray-700 font-bold">
                                        Password
                                    </Label>

                                    <Link to="#" className="text-xs font-bold text-violet-600 hover:text-violet-700">
                                        Forgot?
                                    </Link>

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
                                className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold shadow-lg shadow-violet-200 transition-all hover:scale-[1.02]"
                                disabled={loading}
                            >
                                {loading ? "Checking..." : "Sign In"}
                            </Button>

                            {/* Google */}

                            <Button
                                type="button"
                                onClick={loginWithGoogle}
                                className="w-full h-12 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold shadow-sm transition-all hover:shadow-md hover:scale-[1.01] flex items-center justify-center gap-3"
                            >

                                <svg viewBox="0 0 48 48" className="w-5 h-5">
                                    <path fill="#EA4335" d="M24 9.5c3.1 0 5.9 1.1 8.1 3.2l6-6C34.6 2.4 29.7 0 24 0 14.7 0 6.6 5.5 2.7 13.4l7 5.4C11.6 13 17.3 9.5 24 9.5z" />
                                    <path fill="#4285F4" d="M46.5 24.5c0-1.7-.2-3.3-.5-4.8H24v9.1h12.7c-.5 2.7-2.1 5-4.5 6.6l7 5.4c4.1-3.8 6.3-9.4 6.3-16.3z" />
                                    <path fill="#FBBC05" d="M9.7 28.8c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8l-7-5.4C1 17 0 20.4 0 24s1 7 2.7 10.2l7-5.4z" />
                                    <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-7-5.4c-2 1.3-4.6 2.1-9 2.1-6.7 0-12.4-3.5-14.3-8.4l-7 5.4C6.6 42.5 14.7 48 24 48z" />
                                </svg>

                                Continue with Google

                            </Button>

                            {/* Facebook */}

                            {/* <Button
                                type="button"
                                onClick={loginwithFacebook}
                                className="w-full h-12 rounded-2xl bg-[#1877F2] hover:bg-[#166fe0] text-white font-semibold shadow-sm transition-all hover:shadow-md hover:scale-[1.01] flex items-center justify-center gap-3"
                            >

                                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.019 4.388 11.006 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.017 1.792-4.686 4.533-4.686 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.079 24 18.092 24 12.073z"/>
                                </svg>

                                Continue with Facebook

                            </Button> */}

                            {/* GitHub */}

                            <Button
                                type="button"
                                onClick={loginwithGithub}
                                className="w-full h-12 rounded-2xl bg-black hover:bg-gray-900 text-white font-semibold shadow-sm transition-all hover:shadow-md hover:scale-[1.01] flex items-center justify-center gap-3"
                            >

                                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                                    <path d="M12 .5C5.65.5.5 5.67.5 12.05c0 5.1 3.29 9.42 7.86 10.95.57.1.78-.25.78-.55v-2.01c-3.2.7-3.88-1.55-3.88-1.55-.52-1.35-1.27-1.71-1.27-1.71-1.04-.72.08-.7.08-.7 1.15.08 1.75 1.2 1.75 1.2 1.02 1.77 2.67 1.26 3.32.97.1-.75.4-1.26.73-1.55-2.55-.3-5.24-1.29-5.24-5.73 0-1.27.45-2.31 1.19-3.13-.12-.3-.52-1.52.11-3.17 0 0 .97-.31 3.18 1.2a10.9 10.9 0 0 1 5.8 0c2.2-1.51 3.17-1.2 3.17-1.2.64 1.65.24 2.87.12 3.17.74.82 1.19 1.86 1.19 3.13 0 4.45-2.7 5.43-5.27 5.72.41.36.77 1.09.77 2.2v3.26c0 .31.2.66.79.55A11.55 11.55 0 0 0 23.5 12.05C23.5 5.67 18.35.5 12 .5z" />
                                </svg>

                                Continue with GitHub

                            </Button>

                            <p className="text-sm text-center text-gray-500 font-medium">
                                New here?{" "}
                                <Link to="/signup" className="text-violet-600 font-bold hover:text-violet-700">
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