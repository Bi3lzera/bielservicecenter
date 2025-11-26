import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Mesh Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-indigo-300/30 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, -45, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-fuchsia-300/20 rounded-full blur-[120px]"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-20 z-10"
            >
                <h1 className="text-7xl font-bold text-slate-900 mb-6 tracking-tight">
                    Biel's <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">Service Center</span>
                </h1>
            </motion.div>


            <div className="flex flex-col items-center w-full max-w-2xl mx-auto z-10">
                {/* Prominent Client Card */}
                <Link to="/client/login" className="w-full mb-12">
                    <motion.div
                        whileHover={{ scale: 1.03, y: -8 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="group relative bg-white/90 backdrop-blur-md border-2 border-indigo-200 p-16 rounded-[3rem] shadow-2xl hover:shadow-indigo-300/50 transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                        {/* Gradient Overlay on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Large Icon Background */}
                        <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-indigo-600">
                                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                            </svg>
                        </div>

                        <div className="relative z-10 text-center">
                            <motion.div
                                whileHover={{ rotate: [0, -10, 10, 0] }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center justify-center bg-gradient-to-br from-indigo-500 to-fuchsia-600 p-6 rounded-3xl mb-8 shadow-lg shadow-indigo-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                                </svg>
                            </motion.div>

                            <h2 className="text-5xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                                Acessar e Criar Chamados
                            </h2>
                            <p className="text-slate-500 text-xl font-medium mb-8 max-w-xl mx-auto leading-relaxed">
                                Visualize todos os chamados do sistema e crie novas solicitações
                            </p>

                            <div className="inline-flex items-center text-indigo-600 font-bold text-xl group-hover:gap-4 gap-2 transition-all">
                                <span>Acessar Portal</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-2 transition-transform">
                                    <path d="m9 18 6-6-6-6"></path>
                                </svg>
                            </div>
                        </div>
                    </motion.div>
                </Link>

                {/* Subtle Employee Link */}
                <Link to="/employee/login">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-slate-400 hover:text-indigo-600 transition-colors text-sm font-medium flex items-center gap-2 group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100">
                            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                        </svg>
                        Acessar Portal ADM
                    </motion.div>
                </Link>
            </div>

            <footer className="absolute bottom-8 text-slate-400 text-sm font-medium tracking-wide">
                &copy; 2024 Biel's Service Center
            </footer>
        </div>
    );
};

export default Home;
