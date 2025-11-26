import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle } from 'lucide-react';
import api from '../services/api';

interface Comment {
    id: number;
    ticket_uuid: string;
    message: string;
    sender_name: string;
    sender_type: 'client' | 'admin';
    created_at: string;
}

interface CommentsSectionProps {
    ticketUuid: string;
    currentUserName: string;
    isAdmin?: boolean;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ ticketUuid, currentUserName, isAdmin = false }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchComments();
    }, [ticketUuid]);

    useEffect(() => {
        scrollToBottom();
    }, [comments]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchComments = async () => {
        try {
            const response = await api.get(`/tickets/${ticketUuid}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setLoading(true);
        try {
            const response = await api.post(`/tickets/${ticketUuid}/comments`, {
                message: newMessage.trim(),
                sender_name: isAdmin ? 'Admin' : currentUserName,
                sender_type: isAdmin ? 'admin' : 'client',
            });

            setComments([...comments, response.data]);
            setNewMessage('');
        } catch (error) {
            alert('Erro ao enviar mensagem');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/60 backdrop-blur-sm border-2 border-slate-200 rounded-2xl overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-bold">Mensagens</h3>
                {comments.length > 0 && (
                    <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">
                        {comments.length} {comments.length === 1 ? 'mensagem' : 'mensagens'}
                    </span>
                )}
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                <AnimatePresence>
                    {comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <MessageCircle className="w-16 h-16 mb-3 opacity-20" />
                            <p className="text-sm">Nenhuma mensagem ainda</p>
                            <p className="text-xs">Seja o primeiro a enviar uma mensagem!</p>
                        </div>
                    ) : (
                        comments.map((comment, index) => {
                            const isCurrentUser = (isAdmin && comment.sender_type === 'admin') ||
                                (!isAdmin && comment.sender_name === currentUserName && comment.sender_type === 'client');
                            const isAdminMessage = comment.sender_type === 'admin';

                            return (
                                <motion.div
                                    key={comment.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold ${isAdminMessage ? 'text-rose-600' : 'text-indigo-600'
                                                }`}>
                                                {comment.sender_name}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {new Date(comment.created_at).toLocaleString('pt-BR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <div className={`p-3 rounded-2xl ${isCurrentUser
                                            ? isAdminMessage
                                                ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white'
                                                : 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white'
                                            : 'bg-white border-2 border-slate-200 text-slate-800'
                                            }`}>
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                                {comment.message}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t-2 border-slate-200">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Digite sua mensagem..."
                        className="flex-1 border-2 border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none bg-slate-50 focus:bg-white"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={loading}
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={loading || !newMessage.trim()}
                        className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[50px]"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </motion.button>
                </div>
            </form>
        </div>
    );
};

export default CommentsSection;
