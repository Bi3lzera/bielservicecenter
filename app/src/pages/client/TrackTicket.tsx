import React, { useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { Search, ArrowLeft, Clock, AlertTriangle, CheckCircle, ThumbsUp, ThumbsDown, Users, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TrackTicket: React.FC = () => {
    const [uuid, setUuid] = useState('');
    const [ticketData, setTicketData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [feedbackSent, setFeedbackSent] = useState(false);

    const fetchTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setTicketData(null);
        try {
            const response = await api.get(`/tickets/${uuid}`);
            setTicketData(response.data);
        } catch (err) {
            setError('Chamado não encontrado. Verifique o protocolo digitado.');
        } finally {
            setLoading(false);
        }
    };

    const sendFeedback = async (satisfaction: 'Satisfeito' | 'Insatisfeito') => {
        try {
            await api.patch(`/tickets/${uuid}/feedback`, { satisfaction });
            setFeedbackSent(true);
            const response = await api.get(`/tickets/${uuid}`);
            setTicketData(response.data);
        } catch (err) {
            alert('Erro ao enviar feedback.');
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Resolvido': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Rejeitado': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'Aberto': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Em Andamento': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getUrgencyStyles = (urgency: string) => {
        switch (urgency) {
            case 'Alta': return 'text-rose-600 bg-rose-50 border-rose-100';
            case 'Média': return 'text-amber-600 bg-amber-50 border-amber-100';
            default: return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <Link to="/" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors group font-medium">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Voltar ao Início
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-[2.5rem] p-12 mb-8"
                >
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-slate-800 mb-3">Acompanhar Chamado</h2>
                        <p className="text-slate-500 text-lg">Digite o protocolo do seu atendimento para ver o status.</p>
                    </div>

                    <form onSubmit={fetchTicket} className="flex gap-4 max-w-xl mx-auto relative">
                        <div className="relative flex-1 group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Search className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Digite o Protocolo (UUID)"
                                required
                                className="block w-full pl-14 border border-slate-200 rounded-2xl shadow-sm p-5 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-mono text-slate-700 bg-slate-50 focus:bg-white outline-none text-lg"
                                value={uuid}
                                onChange={(e) => setUuid(e.target.value)}
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 text-white px-10 py-5 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 font-bold shadow-lg shadow-indigo-200 transition-all flex items-center text-lg"
                        >
                            {loading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : 'Buscar'}
                        </motion.button>
                    </form>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-6 p-4 bg-rose-50 text-rose-700 text-center rounded-xl border border-rose-100 font-medium"
                        >
                            {error}
                        </motion.div>
                    )}
                </motion.div>

                <AnimatePresence mode="wait">
                    {ticketData && (
                        <motion.div
                            key="ticket"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="glass rounded-[2.5rem] overflow-hidden"
                        >
                            <div className="p-12">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-10 border-b border-slate-100">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className={`px-4 py-1.5 text-sm font-bold rounded-full border ${getStatusStyles(ticketData.ticket.status)}`}>
                                                {ticketData.ticket.status.replace('_', ' ')}
                                            </span>
                                            <span className={`px-4 py-1.5 text-sm font-semibold rounded-full border flex items-center ${getUrgencyStyles(ticketData.ticket.urgency)}`}>
                                                <AlertTriangle className="w-4 h-4 mr-2" />
                                                {ticketData.ticket.urgency}
                                            </span>
                                        </div>
                                        <h3 className="text-4xl font-bold text-slate-900 leading-tight">{ticketData.ticket.title}</h3>
                                    </div>
                                    <div className="mt-6 md:mt-0 text-right text-sm text-slate-500 flex flex-col items-end bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <div className="flex items-center mb-2 font-medium text-slate-700 text-base">
                                            <Clock className="w-5 h-5 mr-2 text-indigo-500" />
                                            Criado em {new Date(ticketData.ticket.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-slate-400 font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                                            {ticketData.ticket.uuid}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-12">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                                        <Activity className="w-4 h-4 mr-2" />
                                        Descrição do Problema
                                    </h4>
                                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 text-slate-700 leading-relaxed text-lg shadow-inner">
                                        {ticketData.ticket.description}
                                    </div>
                                </div>

                                {ticketData.ticket.status === 'Aberto' && (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-10 rounded-[2rem] mb-12 flex items-center justify-center relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                        <div className="text-center relative z-10">
                                            <motion.div
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100"
                                            >
                                                <Users className="w-12 h-12 text-indigo-600" />
                                            </motion.div>
                                            <p className="text-indigo-900 font-bold text-2xl mb-2">
                                                Fila de Espera
                                            </p>
                                            <div className="flex items-baseline justify-center gap-3">
                                                <span className="text-7xl font-extrabold text-indigo-600 tracking-tighter">
                                                    {ticketData.queue_position}º
                                                </span>
                                                <span className="text-indigo-400 font-medium text-xl">lugar</span>
                                            </div>
                                            <p className="text-indigo-600/70 text-base mt-2 font-medium">
                                                Existem {ticketData.queue_position} pessoas aguardando atendimento
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {ticketData.ticket.status === 'Resolvido' && !feedbackSent && !ticketData.ticket.status.startsWith('Fechado') && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="bg-emerald-50 border border-emerald-100 p-12 rounded-[2rem] text-center relative overflow-hidden"
                                    >
                                        <div className="relative z-10">
                                            <h4 className="text-3xl font-bold text-emerald-900 mb-4">Seu problema foi resolvido?</h4>
                                            <p className="text-emerald-700 mb-10 max-w-lg mx-auto text-lg">Sua opinião é fundamental para melhorarmos nosso atendimento. Por favor, avalie a solução apresentada.</p>
                                            <div className="flex justify-center gap-6">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => sendFeedback('Satisfeito')}
                                                    className="flex items-center bg-emerald-600 text-white px-10 py-5 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 font-bold text-lg"
                                                >
                                                    <ThumbsUp className="w-6 h-6 mr-3" />
                                                    Estou Satisfeito
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => sendFeedback('Insatisfeito')}
                                                    className="flex items-center bg-white text-rose-600 border border-rose-200 px-10 py-5 rounded-2xl hover:bg-rose-50 transition-all font-bold text-lg shadow-sm"
                                                >
                                                    <ThumbsDown className="w-6 h-6 mr-3" />
                                                    Não Resolveu
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {(ticketData.ticket.status.startsWith('Fechado') || feedbackSent) && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-slate-50 border border-slate-200 p-10 rounded-[2rem] text-center"
                                    >
                                        <div className="flex items-center justify-center mb-4">
                                            <CheckCircle className="w-10 h-10 text-emerald-500 mr-4" />
                                            <span className="font-bold text-slate-800 text-2xl">Obrigado pelo seu feedback!</span>
                                        </div>
                                        <p className="text-slate-500 text-lg">Sua avaliação foi registrada e o chamado foi encerrado.</p>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TrackTicket;
