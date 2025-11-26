import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, ArrowLeft, LogIn } from 'lucide-react';
import { setClientName, isLoggedIn } from '../../utils/clientAuth';

const ClientLogin: React.FC = () => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // If already logged in, redirect to tickets
        if (isLoggedIn()) {
            navigate('/client/tickets');
        }
    }, [navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (name.trim().length < 2) {
            setError('Por favor, digite um nome com pelo menos 2 caracteres');
            return;
        }

        setClientName(name);
        navigate('/client/tickets');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-fuchsia-200/20 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <Link to="/" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors group font-medium">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Voltar ao Início
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/90 backdrop-blur-md border-2 border-indigo-100 p-10 rounded-[2.5rem] shadow-2xl"
                >
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="inline-flex items-center justify-center bg-gradient-to-br from-indigo-500 to-fuchsia-600 p-5 rounded-3xl mb-6 shadow-lg shadow-indigo-200"
                        >
                            <User className="w-10 h-10 text-white" />
                        </motion.div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-3">Bem-vindo!</h1>
                        <p className="text-slate-500 text-lg">Digite seu nome para acessar o sistema</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r text-rose-700"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3">
                                Seu Nome
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Ex: Paulo Silva"
                                className="block w-full border-2 border-slate-200 rounded-2xl shadow-sm p-5 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white hover:bg-white outline-none text-lg"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setError('');
                                }}
                                autoFocus
                            />
                            <p className="text-slate-400 text-sm mt-2">
                                Este nome será usado para identificar seus chamados
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white py-5 px-6 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center group"
                        >
                            <LogIn className="w-6 h-6 mr-3 group-hover:translate-x-1 transition-transform" />
                            Acessar Sistema
                        </motion.button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-400">
                        <p>⚠️ Qualquer pessoa com este nome pode acessar seus chamados</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ClientLogin;
