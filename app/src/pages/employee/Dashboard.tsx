import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Clock, AlertTriangle, CheckCircle, XCircle, PlayCircle, Search, Trash2, User, RotateCcw, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CommentsSection from '../../components/CommentsSection';
import DateTimePicker from '../../components/DateTimePicker';
import NotificationBell from '../../components/NotificationBell';

interface Ticket {
    uuid: string;
    title: string;
    description: string;
    urgency: string;
    status: string;
    client_name: string;
    created_at: string;
    deadline: string | null;
}

const Dashboard: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('todos');
    const [showUserManagement, setShowUserManagement] = useState(false);
    const [deadlinePickerOpen, setDeadlinePickerOpen] = useState(false);
    const [deadlineTicketUuid, setDeadlineTicketUuid] = useState<string>('');
    const [deadlineInitialValue, setDeadlineInitialValue] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await api.get('/admin/tickets');
                setTickets(response.data);
            } catch (err) {
                console.error('Failed to fetch tickets', err);
                navigate('/employee/login');
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, [navigate]);

    const updateStatus = async (uuid: string, status: string) => {
        // Confirmation for critical status changes
        if (status === 'Resolvido' || status === 'Rejeitado') {
            if (!confirm(`Tem certeza que deseja marcar como "${status}"? Esta ação pode ser revertida.`)) {
                return;
            }
        }

        try {
            await api.put(`/admin/tickets/${uuid}`, { status });
            setTickets(tickets.map(t => t.uuid === uuid ? { ...t, status } : t));
        } catch (err) {
            alert('Erro ao atualizar status.');
        }
    };

    const updateDeadline = async (uuid: string, deadline: string) => {
        try {
            // Envia a data/hora exatamente como foi digitada, sem conversão de timezone
            await api.put(`/admin/tickets/${uuid}`, { deadline: deadline + ':00' });
            setTickets(tickets.map(t => t.uuid === uuid ? { ...t, deadline: deadline + ':00' } : t));
        } catch (err) {
            alert('Erro ao definir prazo.');
        }
    };

    const deleteTicket = async (uuid: string) => {
        if (!confirm('Tem certeza que deseja excluir este chamado? Esta ação não pode ser desfeita.')) {
            return;
        }
        try {
            await api.delete(`/admin/tickets/${uuid}`);
            setTickets(tickets.filter(t => t.uuid !== uuid));
        } catch (err) {
            alert('Erro ao excluir chamado.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            'Resolvido': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'Rejeitado': 'bg-rose-100 text-rose-700 border-rose-200',
            'Aberto': 'bg-amber-100 text-amber-700 border-amber-200',
            'Em Andamento': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'Fechado_Satisfeito': 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
            'Fechado_Insatisfeito': 'bg-slate-100 text-slate-700 border-slate-200',
        };
        const style = styles[status as keyof typeof styles] || 'bg-slate-100 text-slate-700';
        return (
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${style} inline-flex items-center`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${status === 'Aberto' ? 'animate-pulse bg-amber-500' : 'bg-current'}`}></span>
                {status.replace('_', ' ')}
            </span>
        );
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.uuid.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'todos' || ticket.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-slate-500 font-medium">Carregando painel...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center">
                            <div className="bg-gradient-to-br from-indigo-500 to-fuchsia-600 p-2.5 rounded-xl mr-4 shadow-lg shadow-indigo-200">
                                <LayoutDashboard className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Biel's Service Center</h1>
                                <p className="text-xs text-slate-500 font-medium">Painel Administrativo</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <NotificationBell />
                            <div className="hidden md:flex items-center bg-slate-100 rounded-2xl px-4 py-2.5 border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all w-80">
                                <Search className="w-5 h-5 text-slate-400 mr-3" />
                                <input
                                    type="text"
                                    placeholder="Buscar chamados..."
                                    className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none text-slate-700"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleLogout}
                                className="flex items-center text-slate-500 hover:text-rose-600 transition-colors px-4 py-2 rounded-xl hover:bg-rose-50 text-sm font-bold"
                            >
                                <LogOut className="h-5 w-5 mr-2" />
                                Sair
                            </motion.button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">Chamados Recentes</h2>
                    <div className="flex gap-2">
                        {/* Status Filter Dropdown */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer font-medium text-sm"
                        >
                            <option value="todos">🔍 Todos</option>
                            <option value="Aberto">🟡 Abertos</option>
                            <option value="Em Andamento">🔵 Em Andamento</option>
                            <option value="Resolvido">✅ Resolvidos</option>
                            <option value="Rejeitado">❌ Rejeitados</option>
                        </select>

                        {/* User Management Button */}
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowUserManagement(!showUserManagement)}
                            className={`p-3 border rounded-xl shadow-sm transition-all font-medium text-sm flex items-center gap-2 ${showUserManagement
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <User className="w-5 h-5" />
                            Usuários
                        </motion.button>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    <th className="px-8 py-6 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Prioridade / Data</th>
                                    <th className="px-8 py-6 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Detalhes</th>
                                    <th className="px-8 py-6 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-6 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Prazo</th>
                                    <th className="px-8 py-6 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                <AnimatePresence>
                                    {filteredTickets.map((ticket) => (
                                        <motion.tr
                                            key={ticket.uuid}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            layout
                                            className="hover:bg-indigo-50/30 transition-colors group"
                                        >
                                            <td className="px-8 py-6 whitespace-nowrap align-top">
                                                <div className="flex flex-col space-y-3">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold w-fit shadow-sm
                                                        ${ticket.urgency === 'Alta' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                                            ticket.urgency === 'Média' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                                'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                                                        <AlertTriangle className="w-3 h-3 mr-1.5" />
                                                        {ticket.urgency}
                                                    </span>
                                                    <div className="text-xs text-slate-400 flex items-center font-medium">
                                                        <Clock className="w-3 h-3 mr-1.5" />
                                                        {new Date(ticket.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 align-top">
                                                <button
                                                    onClick={() => setSelectedTicket(ticket)}
                                                    className="text-left w-full group-hover:text-indigo-600 transition-colors"
                                                >
                                                    <div className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                                                        {ticket.title}
                                                        <MessageCircle className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </button>
                                                <div className="text-sm text-slate-500 max-w-md line-clamp-2 leading-relaxed mb-2">
                                                    {ticket.description}
                                                </div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="text-xs text-slate-300 font-mono bg-slate-50 inline-block px-2 py-1 rounded border border-slate-100">
                                                        #{ticket.uuid.slice(0, 8)}...
                                                    </div>
                                                    <div className="text-xs text-indigo-600 font-semibold bg-indigo-50 inline-block px-2 py-1 rounded border border-indigo-100 flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {ticket.client_name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap align-top">
                                                {getStatusBadge(ticket.status)}
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap align-top">
                                                <input
                                                    type="datetime-local"
                                                    className="block w-full text-sm border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all p-2.5 outline-none"
                                                    value={ticket.deadline ? ticket.deadline.slice(0, 16) : ''}
                                                    onChange={(e) => updateDeadline(ticket.uuid, e.target.value)}
                                                />
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-right align-top">
                                                {ticket.status !== 'Resolvido' && ticket.status !== 'Rejeitado' && !ticket.status.startsWith('Fechado') && (
                                                    <div className="flex justify-end space-x-3">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => {
                                                                setDeadlineTicketUuid(ticket.uuid);
                                                                setDeadlineInitialValue(ticket.deadline ? new Date(ticket.deadline).toISOString().slice(0, 16) : '');
                                                                setDeadlinePickerOpen(true);
                                                            }}
                                                            className="text-violet-600 hover:text-white hover:bg-violet-600 p-2 rounded-xl transition-all shadow-sm border border-violet-100 hover:border-violet-600"
                                                            title="Definir Prazo"
                                                        >
                                                            <Clock className="w-5 h-5" />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => updateStatus(ticket.uuid, 'Em Andamento')}
                                                            className="text-indigo-600 hover:text-white hover:bg-indigo-600 p-2 rounded-xl transition-all shadow-sm border border-indigo-100 hover:border-indigo-600"
                                                            title="Assumir Chamado"
                                                        >
                                                            <PlayCircle className="w-5 h-5" />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => updateStatus(ticket.uuid, 'Resolvido')}
                                                            className="text-emerald-600 hover:text-white hover:bg-emerald-600 p-2 rounded-xl transition-all shadow-sm border border-emerald-100 hover:border-emerald-600"
                                                            title="Marcar como Resolvido"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => updateStatus(ticket.uuid, 'Rejeitado')}
                                                            className="text-rose-600 hover:text-white hover:bg-rose-600 p-2 rounded-xl transition-all shadow-sm border border-rose-100 hover:border-rose-600"
                                                            title="Rejeitar Chamado"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => deleteTicket(ticket.uuid)}
                                                            className="text-slate-600 hover:text-white hover:bg-slate-700 p-2 rounded-xl transition-all shadow-sm border border-slate-100 hover:border-slate-700"
                                                            title="Excluir Chamado"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </motion.button>
                                                    </div>
                                                )}
                                                {(ticket.status === 'Resolvido' || ticket.status === 'Rejeitado' || ticket.status.startsWith('Fechado')) && (
                                                    <div className="flex justify-end space-x-3">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => updateStatus(ticket.uuid, 'Aberto')}
                                                            className="text-amber-600 hover:text-white hover:bg-amber-600 p-2 rounded-xl transition-all shadow-sm border border-amber-100 hover:border-amber-600"
                                                            title="Reabrir Chamado"
                                                        >
                                                            <RotateCcw className="w-5 h-5" />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => deleteTicket(ticket.uuid)}
                                                            className="text-slate-600 hover:text-white hover:bg-slate-700 p-2 rounded-xl transition-all shadow-sm border border-slate-100 hover:border-slate-700"
                                                            title="Excluir Chamado"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </motion.button>
                                                    </div>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                    {filteredTickets.length === 0 && (
                        <div className="p-20 text-center text-slate-500">
                            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-slate-300" />
                            </div>
                            <p className="text-xl font-bold text-slate-700 mb-2">Nenhum chamado encontrado</p>
                            <p className="text-slate-400">Tente ajustar seus filtros de busca</p>
                        </div>
                    )}
                </div>

                {/* User Management Modal */}
                <AnimatePresence>
                    {showUserManagement && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setShowUserManagement(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[85vh] flex flex-col overflow-hidden"
                            >
                                {/* Modal Header */}
                                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold flex items-center gap-2">
                                            <User className="w-6 h-6" />
                                            Gestão de Usuários
                                        </h3>
                                        <p className="text-indigo-100 text-sm mt-1">
                                            {Array.from(new Set(tickets.map(t => t.client_name))).length} usuários únicos que criaram chamados
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowUserManagement(false)}
                                        className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Modal Content */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Array.from(new Set(tickets.map(t => t.client_name))).map((clientName, index) => {
                                            const userTickets = tickets.filter(t => t.client_name === clientName);
                                            return (
                                                <motion.div
                                                    key={clientName}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-300 transition-all hover:shadow-lg group"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="bg-indigo-100 p-2 rounded-full">
                                                                <User className="w-4 h-4 text-indigo-600" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-slate-900">{clientName}</h4>
                                                                <p className="text-xs text-slate-500">
                                                                    {userTickets.length} {userTickets.length === 1 ? 'chamado' : 'chamados'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-slate-400 mb-2">
                                                        Status dos chamados:
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                                        {userTickets.filter(t => t.status === 'Aberto').length > 0 && (
                                                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                                                                {userTickets.filter(t => t.status === 'Aberto').length} Aberto(s)
                                                            </span>
                                                        )}
                                                        {userTickets.filter(t => t.status === 'Em Andamento').length > 0 && (
                                                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                                                                {userTickets.filter(t => t.status === 'Em Andamento').length} Em Andamento
                                                            </span>
                                                        )}
                                                        {userTickets.filter(t => t.status === 'Resolvido').length > 0 && (
                                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                                                {userTickets.filter(t => t.status === 'Resolvido').length} Resolvido(s)
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="pt-3 border-t flex gap-2">
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => {
                                                                const newName = prompt(`Renomear "${clientName}" para:`, clientName);
                                                                if (newName && newName !== clientName) {
                                                                    Promise.all(
                                                                        userTickets.map(ticket =>
                                                                            api.put(`/admin/tickets/${ticket.uuid}`, {
                                                                                ...ticket,
                                                                                client_name: newName
                                                                            })
                                                                        )
                                                                    ).then(() => {
                                                                        alert('Usuário renomeado!');
                                                                        window.location.reload();
                                                                    }).catch(() => alert('Erro ao renomear'));
                                                                }
                                                            }}
                                                            className="flex-1 bg-indigo-50 text-indigo-600 py-2 px-3 rounded-lg hover:bg-indigo-100 font-bold text-sm transition-all"
                                                        >
                                                            Editar
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => {
                                                                if (confirm(`Excluir TODOS os ${userTickets.length} chamados de "${clientName}"?`)) {
                                                                    Promise.all(
                                                                        userTickets.map(ticket =>
                                                                            api.delete(`/admin/tickets/${ticket.uuid}`)
                                                                        )
                                                                    ).then(() => {
                                                                        alert('Chamados excluídos!');
                                                                        window.location.reload();
                                                                    }).catch(() => alert('Erro ao excluir'));
                                                                }
                                                            }}
                                                            className="bg-rose-50 text-rose-600 py-2 px-3 rounded-lg hover:bg-rose-100 font-bold text-sm transition-all flex items-center gap-1"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </motion.button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                    {tickets.length === 0 && (
                                        <div className="text-center py-12 text-slate-400">
                                            <User className="w-16 h-16 mx-auto mb-3 opacity-20" />
                                            <p>Nenhum usuário encontrado</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Comments Modal */}
                <AnimatePresence>
                    {selectedTicket && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setSelectedTicket(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full h-[80vh] flex flex-col overflow-hidden"
                            >
                                {/* Modal Header */}
                                <div className="p-6 border-b flex items-start justify-between">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedTicket.title}</h2>
                                        <div className="flex items-center gap-3 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                <strong>{selectedTicket.client_name}</strong>
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {new Date(selectedTicket.created_at).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedTicket(null)}
                                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Modal Content - Comments */}
                                <div className="flex-1 p-6 overflow-hidden">
                                    <CommentsSection
                                        ticketUuid={selectedTicket.uuid}
                                        currentUserName="Admin"
                                        isAdmin={true}
                                    />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* DateTimePicker Modal */}
                <DateTimePicker
                    isOpen={deadlinePickerOpen}
                    onClose={() => setDeadlinePickerOpen(false)}
                    onConfirm={(datetime) => {
                        updateDeadline(deadlineTicketUuid, datetime);
                    }}
                    initialValue={deadlineInitialValue}
                    title="Definir Prazo do Chamado"
                />
            </main>
        </div>
    );
};

export default Dashboard;
