import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaRobot, FaChartBar, FaDatabase, FaSearch, FaTwitter, FaFileUpload, FaExchangeAlt, FaHourglassStart } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const stats = await getDashboardStats();
                setData(stats);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
                <FaHourglassStart className="animate-spin text-4xl text-blue-500" />
            </div>
        );
    }

    if (!data || data.status === 'empty') {
        return (
            <div className="p-8 min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center justify-center text-center">
                <div className="bg-slate-900/50 p-12 rounded-2xl border border-slate-800 shadow-2xl max-w-2xl">
                    <FaRobot className="text-8xl text-slate-700 mb-6 mx-auto" />
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        System Ready
                    </h1>
                    <p className="text-slate-400 text-lg mb-8">
                        The session has been reset for a fresh experiment.
                        Please start by training a model to generate new insights.
                    </p>
                    <button onClick={() => navigate('/training')} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all flex items-center mx-auto">
                        <FaRobot className="mr-3" /> Start Model Training
                    </button>
                    <div className="mt-8 text-sm text-slate-500 flex justify-center gap-6">
                        <span className="flex items-center"><FaCheckCircle className="mr-2 text-green-500" /> Storage Cleared</span>
                        <span className="flex items-center"><FaCheckCircle className="mr-2 text-green-500" /> State Reset</span>
                    </div>
                </div>
            </div>
        );
    }

    const { system_status, best_model, performance_data, comparison_data, datasets } = data;

    return (
        <div className="p-8 min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden">
            {/* Header */}
            <header className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Sentiment Analysis Overview
                </h1>
                <p className="text-slate-400 mt-2 text-lg">
                    Decision-level summary of model performance and system status.
                </p>
            </header>

            {/* 1. System Status Section */}
            <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 p-6 rounded-xl border border-green-500/30 shadow-lg flex items-center space-x-4">
                    <div className="p-3 bg-green-500/10 rounded-full text-green-400">
                        <FaCheckCircle className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Backend Status</p>
                        <p className="text-xl font-bold text-green-400">✅ {system_status.backend}</p>
                    </div>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 shadow-lg flex items-center space-x-4">
                    <div className="p-3 bg-blue-500/10 rounded-full text-blue-400">
                        <FaRobot className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Last Trained</p>
                        <p className="text-xl font-bold text-white">{system_status.lastTrained}</p>
                    </div>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 shadow-lg flex items-center space-x-4">
                    <div className="p-3 bg-purple-500/10 rounded-full text-purple-400">
                        <FaDatabase className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Datasets Used</p>
                        <p className="text-xl font-bold text-white">{system_status.datasetsUsed}</p>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (2/3 width) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* 2. Best Model Summary Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-indigo-900/50 to-slate-900 p-8 rounded-2xl border border-indigo-500/30 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FaRobot className="text-9xl text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <span className="text-indigo-400 mr-2">🏆</span> Best Model Performance
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-indigo-200 text-sm mb-1">Best Model</p>
                                <p className="text-3xl font-extrabold text-white">{best_model.name}</p>
                            </div>
                            <div>
                                <p className="text-indigo-200 text-sm mb-1">F1-Score</p>
                                <p className="text-3xl font-extrabold text-green-400">{best_model.f1}</p>
                            </div>
                            <div>
                                <p className="text-indigo-200 text-sm mb-1">Accuracy</p>
                                <p className="text-3xl font-extrabold text-blue-400">{best_model.accuracy}</p>
                            </div>
                            <div>
                                <p className="text-indigo-200 text-sm mb-1">Explainability</p>
                                <p className="text-3xl font-extrabold text-purple-400">{best_model.explainability}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* 3. Model Performance Snapshot */}
                    <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700 shadow-lg">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                            <FaChartBar className="mr-2 text-blue-400" /> Model Performance Comparison (F1-Score)
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performance_data} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                    <XAxis type="number" domain={[0, 1]} tick={{ fill: '#94a3b8' }} />
                                    <YAxis dataKey="name" type="category" tick={{ fill: '#f8fafc', fontWeight: 'bold' }} width={60} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' }}
                                        cursor={{ fill: '#334155', opacity: 0.4 }}
                                    />
                                    <Bar dataKey="f1" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} name="F1 Score" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 4. Trained vs Live Data Performance */}
                    <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700 shadow-lg">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                            <FaExchangeAlt className="mr-2 text-orange-400" /> Trained vs. Live Data (Robustness Check)
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={comparison_data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                                    <YAxis domain={[0, 1]} tick={{ fill: '#94a3b8' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                    <Bar dataKey="Trained" fill="#10b981" name="Trained Data" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Live" fill="#f59e0b" name="Live Data" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* Right Column (1/3 width) */}
                <div className="space-y-8">

                    {/* 5. Explainability Status */}
                    <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700 shadow-lg">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                            <FaSearch className="mr-2 text-purple-400" /> Explainability Status
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                                <span>LIME (Local)</span>
                                <span className="text-green-400 font-bold flex items-center"><FaCheckCircle className="mr-1" /> Enabled</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                                <span>SHAP (Global)</span>
                                <span className="text-green-400 font-bold flex items-center"><FaCheckCircle className="mr-1" /> Enabled</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                Last explanation generated for: <span className="text-indigo-400 font-bold">BERT</span>
                            </p>
                        </div>
                    </div>

                    {/* 6. Dataset Overview */}
                    <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700 shadow-lg">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                            <FaDatabase className="mr-2 text-cyan-400" /> Dataset Overview
                        </h3>
                        <table className="w-full text-sm text-left text-slate-300">
                            <thead className="text-slate-500 uppercase bg-slate-700/30">
                                <tr>
                                    <th className="px-4 py-2 rounded-l-lg">Dataset</th>
                                    <th className="px-4 py-2 rounded-r-lg text-right">Size</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datasets.map((ds: any, idx: number) => (
                                    <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/20">
                                        <td className="px-4 py-3 font-medium">{ds.name}</td>
                                        <td className="px-4 py-3 text-right">{ds.size}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 7. Quick Action Buttons */}
                    <div className="grid grid-cols-1 gap-4">
                        <button onClick={() => navigate('/comparison')} className="flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all font-bold shadow-lg shadow-blue-500/20">
                            <FaChartBar className="mr-2" /> View Trained Results
                        </button>
                        <button onClick={() => navigate('/benchmarks')} className="flex items-center justify-center p-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all font-bold">
                            <FaExchangeAlt className="mr-2" /> Compare Models
                        </button>
                        <button onClick={() => navigate('/live-twitter')} className="flex items-center justify-center p-4 bg-sky-600 hover:bg-sky-500 rounded-xl transition-all font-bold shadow-lg shadow-sky-500/20">
                            <FaTwitter className="mr-2" /> Live Twitter Analysis
                        </button>
                        <button className="flex items-center justify-center p-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all font-bold opacity-70 cursor-not-allowed" disabled>
                            <FaFileUpload className="mr-2" /> Upload New Dataset
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
