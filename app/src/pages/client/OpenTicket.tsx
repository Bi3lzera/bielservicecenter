import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, AlertCircle, FileText, HelpCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getClientName, isLoggedIn } from '../../utils/clientAuth';

const OpenTicket: React.FC = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        reason: 'Dúvida',
        urgency: 'Baixa',
    });
    const [uuid, setUuid] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const clientName = getClientName();

    useEffect(() => {
        // Redirect to login if not logged in
        if (!isLoggedIn()) {
            navigate('/client/login');
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/tickets', {
                ...formData,
                client_name: clientName,
            });
            const ticketUuid = response.data.uuid;
            setUuid(ticketUuid);
        } catch (err) {
            setError('Erro ao abrir chamado. Tente novamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-200/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="max-w-3xl mx-auto relative z-10">
                <Link to="/" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors group font-medium">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Voltar ao Início
                </Link>

                <AnimatePresence mode="wait">
                    {uuid ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass p-12 rounded-[2.5rem] text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="mx-auto bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mb-8"
                            >
                                <CheckCircle className="w-12 h-12 text-emerald-600" />
                            </motion.div>
                            <h2 className="text-4xl font-bold text-slate-800 mb-4">Chamado Registrado!</h2>
                            <p className="text-slate-500 mb-10 text-lg">Sua solicitação foi enviada com sucesso para nossa equipe.</p>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-indigo-50 border border-indigo-100 p-8 rounded-3xl mb-10 relative overflow-hidden group cursor-pointer"
                                onClick={() => navigator.clipboard.writeText(uuid)}
                            >
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                                <p className="text-xs text-indigo-600 uppercase tracking-widest font-bold mb-3">Seu Protocolo</p>
                                <div className="font-mono text-3xl font-bold text-slate-800 select-all break-all tracking-wider group-hover:text-indigo-700 transition-colors">
                                    {uuid}
                                </div>
                                <p className="text-xs text-indigo-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Clique para copiar</p>
                            </motion.div>

                            <div className="flex flex-col space-y-4 max-w-sm mx-auto">
                                <button
                                    onClick={() => navigate('/client/tickets')}
                                    className="w-full bg-indigo-600 text-white py-4 px-8 rounded-2xl hover:bg-indigo-700 font-bold transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-1 active:scale-95"
                                >
                                    Ver Meus Chamados
                                </button>
                                <Link to="/" className="text-slate-500 hover:text-slate-800 font-medium transition-colors py-2">
                                    Voltar ao Início
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="glass rounded-[2rem] overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white relative overflow-hidden">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                                    className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                                />
                                <div className="relative z-10">
                                    <h2 className="text-3xl font-bold mb-2">Abrir Novo Chamado</h2>
                                    <p className="text-indigo-100 text-base font-light max-w-lg">Preencha os dados abaixo para registrar sua solicitação.</p>
                                </div>
                            </div>

                            <div className="p-8">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="bg-rose-50 border-l-4 border-rose-500 p-4 mb-8 rounded-r flex items-center"
                                    >
                                        <AlertCircle className="w-6 h-6 text-rose-500 mr-3 flex-shrink-0" />
                                        <p className="text-rose-700 font-medium">{error}</p>
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="group">
                                        <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                                            <FileText className="w-4 h-4 mr-2 text-indigo-500" />
                                            Título do Chamado
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ex: Problema com acesso ao sistema"
                                            className="block w-full border border-slate-200 rounded-2xl shadow-sm p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white hover:bg-white outline-none text-base"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="group">
                                            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                                                <HelpCircle className="w-4 h-4 mr-2 text-fuchsia-500" />
                                                Motivo
                                            </label>
                                            <div className="relative">
                                                <select
                                                    className="block w-full border border-slate-200 rounded-2xl shadow-sm p-5 focus:ring-4 focus:ring-fuchsia-100 focus:border-fuchsia-500 transition-all bg-slate-50 focus:bg-white hover:bg-white appearance-none outline-none text-lg cursor-pointer"
                                                    value={formData.reason}
                                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                                >
                                                    <option>Dúvida</option>
                                                    <option>Bug</option>
                                                    <option>Solicitação</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-slate-500">
                                                    <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                                                <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                                                Urgência
                                            </label>
                                            <div className="relative">
                                                <select
                                                    className="block w-full border border-slate-200 rounded-2xl shadow-sm p-5 focus:ring-4 focus:ring-amber-100 focus:border-amber-500 transition-all bg-slate-50 focus:bg-white hover:bg-white appearance-none outline-none text-lg cursor-pointer"
                                                    value={formData.urgency}
                                                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                                                >
                                                    <option>Baixa</option>
                                                    <option>Média</option>
                                                    <option>Alta</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-slate-500">
                                                    <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-sm font-bold text-slate-700 mb-3">Descrição Detalhada</label>
                                        <textarea
                                            required
                                            rows={4}
                                            placeholder="Descreva seu problema com o máximo de detalhes possível..."
                                            className="block w-full border border-slate-200 rounded-2xl shadow-sm p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white hover:bg-white resize-none outline-none text-base"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-indigo-600 text-white py-4 px-6 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 font-bold text-base shadow-xl shadow-indigo-200 transition-all flex items-center justify-center group"
                                    >
                                        {loading ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                                Enviando...
                                            </div>
                                        ) : (
                                            <>
                                                <Send className="w-6 h-6 mr-3 group-hover:translate-x-1 transition-transform" />
                                                Abrir Chamado
                                            </>
                                        )}
                                    </motion.button>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OpenTicket;
