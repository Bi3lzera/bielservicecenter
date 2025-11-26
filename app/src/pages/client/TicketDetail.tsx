import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Trash2, User, Clock, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { getClientName, isLoggedIn } from '../../utils/clientAuth';
import CommentsSection from '../../components/CommentsSection';

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

const TicketDetail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const ticketUuid = searchParams.get('uuid');
    const navigate = useNavigate();
    const myName = getClientName();

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        reason: '',
        urgency: '',
    });

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/client/login');
            return;
        }
        if (!ticketUuid) {
            navigate('/client/tickets');
            return;
        }
        fetchTicket();
    }, [ticketUuid, navigate]);

    const fetchTicket = async () => {
        try {
            const response = await api.get(`/tickets/${ticketUuid}`);
            setTicket(response.data.ticket);
            setFormData({
                title: response.data.ticket.title,
                description: response.data.ticket.description,
                reason: response.data.ticket.reason,
                urgency: response.data.ticket.urgency,
            });
        } catch (error) {
            console.error('Failed to fetch ticket:', error);
            alert('Chamado não encontrado');
            navigate('/client/tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await api.put(`/tickets/${ticketUuid}`, formData);
            alert('Chamado atualizado!');
            setEditing(false);
            fetchTicket();
        } catch (error) {
            alert('Erro ao atualizar chamado');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir este chamado?')) return;
        try {
            await api.delete(`/tickets/${ticketUuid}`);
            alert('Chamado excluído!');
            navigate('/client/tickets');
        } catch (error) {
            alert('Erro ao excluir chamado');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!ticket) return null;

    const canEdit = ticket.client_name === myName && ticket.status === 'Aberto';
    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Resolvido': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Rejeitado': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'Aberto': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Em Andamento': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4">
            <div className="max-w-7xl mx-auto h-[calc(100vh-3rem)]">
                <Link to="/client/tickets" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-4 transition-colors group font-medium">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Voltar aos Chamados
                </Link>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100%-2.5rem)]">
                    {/* Left Column - Ticket Details */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/90 backdrop-blur-md border-2 border-indigo-100 rounded-3xl shadow-2xl overflow-y-auto"
                    >
                        <div className="p-6">
                            {/* Header */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusStyles(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${ticket.urgency === 'Alta' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                            ticket.urgency === 'Média' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        }`}>
                                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                                        {ticket.urgency}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                                    <div className="flex items-center gap-2">
                                        <User className="w-3 h-3" />
                                        <span><strong>{ticket.client_name}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                            </div>

                            {/* Content - Compact */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Título</label>
                                    {editing && canEdit ? (
                                        <input
                                            type="text"
                                            className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    ) : (
                                        <h2 className="text-lg font-bold text-slate-900">{ticket.title}</h2>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Motivo</label>
                                        {editing && canEdit ? (
                                            <select
                                                className="w-full border-2 border-slate-200 rounded-xl p-2 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                                                value={formData.reason}
                                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                            >
                                                <option>Dúvida</option>
                                                <option>Bug</option>
                                                <option>Solicitação</option>
                                            </select>
                                        ) : (
                                            <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded-lg">{ticket.reason}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Urgência</label>
                                        {editing && canEdit ? (
                                            <select
                                                className="w-full border-2 border-slate-200 rounded-xl p-2 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                                                value={formData.urgency}
                                                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                                            >
                                                <option>Baixa</option>
                                                <option>Média</option>
                                                <option>Alta</option>
                                            </select>
                                        ) : (
                                            <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded-lg">{ticket.urgency}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Descrição</label>
                                    {editing && canEdit ? (
                                        <textarea
                                            rows={4}
                                            className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none resize-none"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    ) : (
                                        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">{ticket.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Actions - Compact */}
                            {canEdit && (
                                <div className="flex gap-2 mt-4 pt-4 border-t">
                                    {editing ? (
                                        <>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleSave}
                                                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 font-bold text-sm transition-all flex items-center justify-center gap-2"
                                            >
                                                <Save className="w-4 h-4" />
                                                Salvar
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setEditing(false)}
                                                className="px-4 py-2 border-2 border-slate-200 rounded-lg hover:bg-slate-50 font-bold text-sm transition-all"
                                            >
                                                Cancelar
                                            </motion.button>
                                        </>
                                    ) : (
                                        <>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setEditing(true)}
                                                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 font-bold text-sm transition-all"
                                            >
                                                Editar
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleDelete}
                                                className="px-4 py-2 border-2 border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 font-bold text-sm transition-all flex items-center gap-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </motion.button>
                                        </>
                                    )}
                                </div>
                            )}

                            {!canEdit && ticket.client_name !== myName && (
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
                                    ⚠️ Este chamado não pertence a você. Apenas visualização.
                                </div>
                            )}

                            {!canEdit && ticket.client_name === myName && ticket.status !== 'Aberto' && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs">
                                    ℹ️ Este chamado não pode mais ser editado.
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Right Column - Comments */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="h-full"
                    >
                        <CommentsSection
                            ticketUuid={ticket.uuid}
                            currentUserName={myName || ''}
                            isAdmin={false}
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;
