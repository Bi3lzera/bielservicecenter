import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getClientName, isLoggedIn, logout } from '../../utils/clientAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Clock, AlertTriangle, User } from 'lucide-react';

interface Ticket {
    uuid: string;
    title: string;
    description: string;
    reason: string;
    urgency: string;
    status: string;
    client_name: string;
    created_at: string;
    deadline: string | null;
}

const MyTickets: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showOnlyMine, setShowOnlyMine] = useState(true);
    const navigate = useNavigate();
    const myName = getClientName();

    useEffect(() => {
        // Redirect to login if not logged in
        if (!isLoggedIn()) {
            navigate('/client/login');
            return;
        }
        fetchTickets();
    }, [currentPage, navigate]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/tickets?page=${currentPage}&per_page=12`);
            setTickets(response.data.data);
            setTotalPages(response.data.last_page);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
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

    const getUrgencyIcon = (urgency: string) => {
        const baseClasses = "w-5 h-5";
        switch (urgency) {
            case 'Alta': return <AlertTriangle className={`${baseClasses} text-rose-600`} />;
            case 'Média': return <AlertTriangle className={`${baseClasses} text-amber-600`} />;
            default: return <AlertTriangle className={`${baseClasses} text-emerald-600`} />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <Link to="/" className="inline-flex items-center text-slate-500 hover:text-indigo-600 transition-colors group font-medium">
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Voltar ao Início
                    </Link>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            if (confirm(`Deslogar de "${myName}"?`)) {
                                logout();
                                navigate('/client/login');
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl hover:border-rose-300 hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-all font-medium"
                    >
                        <User className="w-4 h-4" />
                        <span className="font-bold">{myName}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" x2="9" y1="12" y2="12"></line>
                        </svg>
                    </motion.button>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-slate-900 mb-4">Meus Chamados</h1>
                    <p className="text-slate-500 text-lg mb-6">Acompanhe todos os chamados do sistema. Os seus estão destacados.</p>

                    {/* Filter Toggle */}
                    <div className="flex items-center justify-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowOnlyMine(true)}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${showOnlyMine
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-indigo-200'
                                }`}
                        >
                            <User className="w-4 h-4 inline mr-2" />
                            Meus Chamados
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowOnlyMine(false)}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${!showOnlyMine
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-indigo-200'
                                }`}
                        >
                            Todos os Chamados
                        </motion.button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <AnimatePresence>
                                {tickets
                                    .filter(ticket => !showOnlyMine || ticket.client_name === myName)
                                    .map((ticket, index) => {
                                        const isMine = ticket.client_name === myName;
                                        return (
                                            <motion.div
                                                key={ticket.uuid}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ delay: index * 0.05 }}
                                                layout
                                            >
                                                <Link
                                                    to={isMine ? `/client/ticket/detail?uuid=${ticket.uuid}` : '#'}
                                                    className={`block h-full ${!isMine && 'cursor-default'}`}
                                                >
                                                    <motion.div
                                                        whileHover={isMine ? { y: -4, scale: 1.02 } : {}}
                                                        className={`h-full p-6 rounded-3xl border-2 transition-all ${isMine
                                                            ? 'bg-white/90 backdrop-blur-md border-indigo-300 shadow-xl shadow-indigo-100 hover:shadow-2xl hover:shadow-indigo-200'
                                                            : 'bg-white/60 backdrop-blur-sm border-slate-200 opacity-75'
                                                            }`}
                                                    >
                                                        {isMine && (
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <div className="bg-indigo-100 p-1.5 rounded-full">
                                                                    <User className="w-4 h-4 text-indigo-600" />
                                                                </div>
                                                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Meu Chamado</span>
                                                            </div>
                                                        )}

                                                        <div className="flex items-start justify-between mb-4">
                                                            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusStyles(ticket.status)}`}>
                                                                {ticket.status}
                                                            </span>
                                                            <div className="flex items-center gap-1">
                                                                {getUrgencyIcon(ticket.urgency)}
                                                                <span className="text-xs font-semibold text-slate-500">{ticket.urgency}</span>
                                                            </div>
                                                        </div>

                                                        <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">{ticket.title}</h3>
                                                        <p className="text-slate-600 text-sm mb-4 line-clamp-3">{ticket.description}</p>

                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center text-xs text-slate-400 gap-2">
                                                                <Clock className="w-4 h-4" />
                                                                {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                                                            </div>
                                                            <div className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100 flex items-center gap-1.5">
                                                                <User className="w-3 h-3" />
                                                                {ticket.client_name}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                            </AnimatePresence>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                                >
                                    Anterior
                                </button>
                                <div className="flex items-center px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold">
                                    {currentPage} / {totalPages}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                                >
                                    Próxima
                                </button>
                            </div>
                        )}

                        {tickets.filter(ticket => !showOnlyMine || ticket.client_name === myName).length === 0 && (
                            <div className="text-center py-20">
                                <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertTriangle className="w-12 h-12 text-slate-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-700 mb-2">Nenhum chamado encontrado</h3>
                                <p className="text-slate-500">
                                    {showOnlyMine
                                        ? 'Você ainda não criou nenhum chamado. Clique no botão + para criar!'
                                        : 'Não há chamados no sistema ainda.'}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Floating Action Button */}
            <Link to="/client/open">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="fixed bottom-8 right-8 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white p-5 rounded-full shadow-2xl shadow-indigo-500/50 hover:shadow-indigo-600/60 transition-all z-50 group"
                >
                    <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
                </motion.button>
            </Link>
        </div >
    );
};

export default MyTickets;
