import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowLeft, LogIn, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.get('/sanctum/csrf-cookie', { baseURL: 'http://localhost:8000' });
            const response = await api.post('/login', { email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/employee/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Falha no login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/2 -left-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, -45, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-1/2 -right-1/2 w-[800px] h-[800px] bg-fuchsia-600/20 rounded-full blur-[120px]"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-dark rounded-[2.5rem] w-full max-w-md overflow-hidden relative z-10"
            >
                <div className="p-12">
                    <div className="text-center mb-12">
                        <motion.div
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            className="bg-gradient-to-br from-indigo-500 to-fuchsia-600 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/30"
                        >
                            <ShieldCheck className="w-12 h-12 text-white" />
                        </motion.div>
                        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Acesso Administrativo</h2>
                        <p className="text-slate-400 text-sm font-medium">Entre com suas credenciais para gerenciar o sistema</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-rose-500/10 border border-rose-500/20 p-4 mb-8 rounded-2xl text-sm text-rose-200 flex items-center"
                        >
                            <div className="w-2 h-2 bg-rose-500 rounded-full mr-3"></div>
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-14 bg-white/5 border border-white/10 rounded-2xl shadow-inner p-5 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all focus:bg-white/10 outline-none"
                                    placeholder="seu.email@provedor.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">Senha</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-14 bg-white/5 border border-white/10 rounded-2xl shadow-inner p-5 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all focus:bg-white/10 outline-none"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white py-5 px-6 rounded-2xl hover:from-indigo-500 hover:to-fuchsia-500 disabled:opacity-50 font-bold shadow-lg shadow-indigo-900/50 transition-all flex items-center justify-center mt-8 text-lg"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <LogIn className="w-6 h-6 mr-3" />
                                    Acessar Painel
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>
                <div className="bg-black/20 px-8 py-6 border-t border-white/5 text-center backdrop-blur-sm">
                    <Link to="/" className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors font-medium">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar ao Início
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
