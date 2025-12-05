import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Check, Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationListProps {
    onClose: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ onClose }) => {
    const { notifications, markAsRead, markAllAsRead } = useNotifications();

    return (
        <div className="flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-600" />
                    Notificações
                </h3>
                <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                            Marcar todas como lidas
                        </button>
                    )}
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-1">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Nenhuma notificação</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {notifications.map((notification) => (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className={`p-3 rounded-xl transition-all hover:bg-slate-50 group relative border ${!notification.read_at ? 'bg-indigo-50/30 border-indigo-100' : 'bg-white border-transparent'
                                    }`}
                            >
                                <div className="flex gap-3">
                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notification.read_at ? 'bg-indigo-500' : 'bg-slate-200'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 mb-0.5">
                                            {notification.data.title}
                                        </p>
                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                            {notification.data.message}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    {!notification.read_at && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-indigo-100 text-indigo-600 rounded-lg self-start"
                                            title="Marcar como lida"
                                        >
                                            <Check className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default NotificationList;
