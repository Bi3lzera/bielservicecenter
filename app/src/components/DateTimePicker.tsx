import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock } from 'lucide-react';

interface DateTimePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (datetime: string) => void;
    initialValue?: string;
    title?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
    isOpen,
    onClose,
    onConfirm,
    initialValue = '',
    title = 'Definir Prazo'
}) => {
    const [datetime, setDatetime] = useState(initialValue || new Date().toISOString().slice(0, 16));

    const handleConfirm = () => {
        if (datetime) {
            onConfirm(datetime);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-xl">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{title}</h3>
                                    <p className="text-violet-100 text-sm">Selecione data e hora</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 mb-3">
                                    Data e Hora do Prazo
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <Clock className="w-5 h-5 text-violet-500" />
                                    </div>
                                    <input
                                        type="datetime-local"
                                        value={datetime}
                                        onChange={(e) => setDatetime(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-violet-100 focus:border-violet-500 transition-all outline-none text-slate-700 font-medium text-lg"
                                    />
                                </div>

                                {/* Preview */}
                                {datetime && (
                                    <div className="mt-4 p-4 bg-violet-50 border border-violet-200 rounded-xl">
                                        <p className="text-xs font-bold text-violet-900 mb-1">VISUALIZAÇÃO:</p>
                                        <p className="text-sm text-violet-700">
                                            {new Date(datetime).toLocaleString('pt-BR', {
                                                dateStyle: 'full',
                                                timeStyle: 'short'
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleConfirm}
                                    disabled={!datetime}
                                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:shadow-lg hover:shadow-violet-200 font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirmar Prazo
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onClose}
                                    className="px-6 py-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-base transition-all text-slate-600"
                                >
                                    Cancelar
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DateTimePicker;
