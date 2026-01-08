import { useState } from 'react';
import { Camera, Image as ImageIcon, Video, Mic, X, Sparkles, Zap, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';

const CreatePage = () => {
    const [content, setContent] = useState('');
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [showAIPrompts, setShowAIPrompts] = useState(false);
    const { user } = useAuthStore((state) => state);
    const aiPrompts = [
        { icon: '🎨', text: 'Create something artistic', color: 'from-pink-500 to-rose-500' },
        { icon: '✨', text: 'Share your thoughts', color: 'from-violet-500 to-purple-500' },
        { icon: '🌟', text: 'Tell a story', color: 'from-blue-500 to-cyan-500' },
        { icon: '💡', text: 'Share an idea', color: 'from-amber-500 to-orange-500' },
    ];

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setMediaPreview(url);
            setMediaType(type);
        }
    };

    const removeMedia = () => {
        if (mediaPreview) URL.revokeObjectURL(mediaPreview);
        setMediaPreview(null);
        setMediaType(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
                <div className="px-4 pt-6 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <motion.div
                                initial={{ rotate: 0 }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            >
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-200">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                            </motion.div>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Create</h1>
                                <p className="text-xs font-bold text-violet-500">Share your moment</p>
                            </div>
                        </div>
                        <Button
                            className="h-11 px-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-violet-200/50 active:scale-95 transition-transform"
                            disabled={!content.trim() && !mediaPreview}
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Post
                        </Button>
                    </div>
                </div>
            </header>

            <div className="px-4 py-6 space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-3">
                    <div className="p-[2.5px] rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
                        <Avatar className="h-14 w-14 rounded-[14px] border-2 border-white">
                            <AvatarImage src="/api/placeholder/56/56" />
                            <AvatarFallback className="bg-violet-50 text-violet-600 font-black text-xl rounded-[12px]">
                                U
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 text-base">{user?.username}</h3>
                        <p className="text-xs font-bold text-gray-400">Posting to everyone</p>
                    </div>
                </div>

                {/* Content Input */}
                <div className="space-y-4">
                    <Textarea
                        placeholder="What's on your mind? ✨"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[160px] resize-none border-0 text-base leading-relaxed bg-transparent focus-visible:ring-0 placeholder:text-gray-400 font-medium p-0"
                    />

                    {/* AI Prompt Suggestions */}
                    <AnimatePresence>
                        {showAIPrompts && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2 overflow-hidden"
                            >
                                {aiPrompts.map((prompt, idx) => (
                                    <motion.button
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => setContent(prompt.text)}
                                        className="w-full flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 hover:border-violet-200 active:scale-98 transition-all group"
                                    >
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${prompt.color} flex items-center justify-center text-lg shadow-sm`}>
                                            {prompt.icon}
                                        </div>
                                        <span className="font-bold text-sm text-gray-700 group-hover:text-violet-600">
                                            {prompt.text}
                                        </span>
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Media Preview */}
                    <AnimatePresence>
                        {mediaPreview && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="relative rounded-3xl overflow-hidden shadow-2xl"
                            >
                                {mediaType === 'image' ? (
                                    <img src={mediaPreview} alt="Preview" className="w-full h-64 object-cover" />
                                ) : (
                                    <video src={mediaPreview} className="w-full h-64 object-cover" controls />
                                )}
                                <button
                                    onClick={removeMedia}
                                    className="absolute top-3 right-3 w-9 h-9 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 active:scale-95 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Action Buttons Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Photo Upload */}
                    <label className="relative cursor-pointer group">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleMediaUpload(e, 'image')}
                            className="hidden"
                        />
                        <div className="h-28 rounded-3xl bg-gradient-to-br from-pink-500 to-rose-500 flex flex-col items-center justify-center gap-2 text-white shadow-lg shadow-pink-200/50 active:scale-95 transition-transform group-hover:shadow-xl">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <ImageIcon className="w-6 h-6" />
                            </div>
                            <span className="font-black text-sm">Photo</span>
                        </div>
                    </label>

                    {/* Video Upload */}
                    <label className="relative cursor-pointer group">
                        <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleMediaUpload(e, 'video')}
                            className="hidden"
                        />
                        <div className="h-28 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-500 flex flex-col items-center justify-center gap-2 text-white shadow-lg shadow-violet-200/50 active:scale-95 transition-transform group-hover:shadow-xl">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Video className="w-6 h-6" />
                            </div>
                            <span className="font-black text-sm">Video</span>
                        </div>
                    </label>

                    {/* Camera */}
                    <button className="h-28 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 flex flex-col items-center justify-center gap-2 text-white shadow-lg shadow-blue-200/50 active:scale-95 transition-transform hover:shadow-xl">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Camera className="w-6 h-6" />
                        </div>
                        <span className="font-black text-sm">Camera</span>
                    </button>

                    {/* Voice Recording */}
                    <button
                        onClick={() => setIsRecording(!isRecording)}
                        className={`h-28 rounded-3xl bg-gradient-to-br flex flex-col items-center justify-center gap-2 text-white shadow-lg active:scale-95 transition-all hover:shadow-xl ${isRecording
                            ? 'from-red-500 to-rose-500 shadow-red-200/50 animate-pulse'
                            : 'from-amber-500 to-orange-500 shadow-amber-200/50'
                            }`}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Mic className="w-6 h-6" />
                        </div>
                        <span className="font-black text-sm">{isRecording ? 'Recording' : 'Voice'}</span>
                    </button>
                </div>

                {/* AI Assist Card */}
                <motion.div
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 text-white shadow-2xl shadow-violet-300/50"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="relative z-10 space-y-3">
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            <h3 className="text-lg font-black">AI Writing Assistant</h3>
                        </div>
                        <p className="text-white/90 text-sm font-medium leading-relaxed">
                            Need inspiration? Let Mooja AI help you craft the perfect post with creative suggestions.
                        </p>
                        <Button
                            onClick={() => setShowAIPrompts(!showAIPrompts)}
                            className="h-10 bg-white text-violet-600 hover:bg-white/90 rounded-full font-black px-5 text-sm shadow-lg active:scale-95 transition-transform"
                        >
                            {showAIPrompts ? 'Hide' : 'Show'} Prompts
                        </Button>
                    </div>
                    <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-white/10 rotate-12" />
                </motion.div>

                {/* Quick Tips */}
                <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-3xl p-4 border border-violet-100">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h4 className="font-black text-sm text-gray-900 mb-1">Pro Tips</h4>
                            <ul className="space-y-1 text-xs font-medium text-gray-600">
                                <li>• Add emojis to make your post more engaging ✨</li>
                                <li>• Tag friends to get more interactions 👥</li>
                                <li>• Post during peak hours for better reach 📈</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePage;