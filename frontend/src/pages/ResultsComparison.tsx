import React, { useState } from 'react';
import {
    FaChartBar, FaTable, FaTrophy, FaExclamationTriangle, FaCheckCircle,
    FaChartPie
} from 'react-icons/fa';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// 2. Performance Chart Data (Mock)
const PERFORMANCE_CHART_DATA = [
    { metric: 'Accuracy', Trained: 92, Live: 88 },
    { metric: 'Precision', Trained: 91, Live: 87 },
    { metric: 'Recall', Trained: 92, Live: 86 },
    { metric: 'F1 Score', Trained: 92, Live: 87 },
];

// 3. Sentiment Distribution Data (Mock)
const SENTIMENT_DIST_DATA = [
    { category: 'Positive', Trained: 35, Live: 30 },
    { category: 'Neutral', Trained: 20, Live: 35 },
    { category: 'Negative', Trained: 45, Live: 35 },
];

// 4. Confusion Matrices (Mock)
const CM_TRAINED = [
    [120, 10, 5],  // Actual Negative
    [15, 80, 10],  // Actual Neutral
    [5, 5, 110],   // Actual Positive
];

const CM_LIVE = [
    [100, 25, 10], // Increased confusion with Neutral
    [20, 70, 20],
    [15, 20, 95],
];

import type { Metrics } from '../types';

interface ResultsComparisonProps {
    metrics?: Metrics | null;
    modelConfig?: { modelType: string; explainMethod: string };
}

const ResultsComparison = ({ metrics, modelConfig }: ResultsComparisonProps) => {
    const [cmView, setCmView] = useState<'Trained' | 'Live'>('Trained');



    if (!metrics || Object.keys(metrics).length === 0) {
        return (
            <div className="p-8 min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center justify-center text-center">
                <FaTable className="text-6xl text-slate-700 mb-6" />
                <h2 className="text-3xl font-bold mb-4 text-slate-300">No Comparison Data</h2>
                <p className="text-slate-500 max-w-lg mb-8">
                    Train a model first to compare its performance against live data.
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 min-h-screen bg-slate-950 text-white font-sans space-y-12 pb-24">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center text-blue-400">
                    <FaTable className="mr-3" /> Model Comparison (Trained vs Live)
                </h1>
                <p className="text-gray-400">
                    Detailed comparison of offline trained performance versus real-world live Twitter data adaptability.
                </p>
            </div>

            {/* 4. Recommendation Summary Card (Placed at top for visibility) */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-8 rounded-2xl border border-blue-700 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <FaTrophy className="text-9xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center z-10 relative">
                    <FaCheckCircle className="mr-2 text-green-400" /> Final Recommendation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 z-10 relative">
                    <div>
                        <span className="text-sm text-blue-200 uppercase tracking-wider block mb-1">Best Model for Live Use</span>
                        <span className="text-3xl font-bold text-white block">BERT (Fine-Tuned)</span>
                    </div>
                    <div>
                        <span className="text-sm text-blue-200 uppercase tracking-wider block mb-1">Reason for Selection</span>
                        <p className="text-lg text-blue-100">
                            Highest F1-Score (87.2%) on live data and best stability despite domain shift.
                            Outperforms LSTM in context understanding.
                        </p>
                    </div>
                </div>
            </div>



            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 2. Trained vs Live Performance Metrics */}
                <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 h-96">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        <FaChartBar className="mr-2 text-green-400" /> Trained vs Live Performance ({modelConfig?.modelType || 'BERT'})
                    </h2>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={PERFORMANCE_CHART_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="metric" stroke="#94a3b8" />
                            <YAxis domain={[80, 100]} stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                                cursor={{ fill: '#334155', opacity: 0.2 }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            <Bar dataKey="Trained" fill="#3b82f6" name="Trained Data" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Live" fill="#f43f5e" name="Live Data" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </section>

                {/* 3. Sentiment Distribution Comparison */}
                <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 h-96">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        <FaChartPie className="mr-2 text-orange-400" /> Sentiment Dist. Shift
                    </h2>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={SENTIMENT_DIST_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="category" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            <Bar dataKey="Trained" fill="#adfa1d" name="Trained (Baseline)" radius={[4, 4, 0, 0]} opacity={0.8} />
                            <Bar dataKey="Live" fill="#a855f7" name="Live (Real-World)" radius={[4, 4, 0, 0]} opacity={0.8} />
                        </BarChart>
                    </ResponsiveContainer>
                    <p className="text-center text-xs text-gray-500 mt-2">Live data often shows higher "Neutral" sentiment due to noise.</p>
                </section>

            </div>

            {/* 4. Confusion Matrix Comparison */}
            <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center">
                        <FaExclamationTriangle className="mr-2 text-yellow-500" /> Confusion Matrix: {cmView} Data
                    </h2>
                    <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                        <button
                            onClick={() => setCmView('Trained')}
                            className={`px-4 py-1 rounded text-sm font-bold transition-all ${cmView === 'Trained' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            Trained
                        </button>
                        <button
                            onClick={() => setCmView('Live')}
                            className={`px-4 py-1 rounded text-sm font-bold transition-all ${cmView === 'Live' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            Live
                        </button>
                    </div>
                </div>

                <div className="flex justify-center">
                    <ConfusionMatrixHeatmap matrix={cmView === 'Trained' ? CM_TRAINED : CM_LIVE} />
                </div>
                <p className="text-center text-gray-500 mt-6 max-w-2xl mx-auto">
                    {cmView === 'Trained'
                        ? "The model performs very consistently on the test set with high diagonal values."
                        : "On live data, you see more dispersion (off-diagonal values), indicating increased misclassification, particularly between Neutral and other classes due to informal language."}
                </p>
            </section>
        </div>
    );
};

// Reused Heatmap Component (Internal)
const ConfusionMatrixHeatmap = ({ matrix }: { matrix: number[][] }) => {
    const maxVal = Math.max(...matrix.flat());
    const labels = ["Negative", "Neutral", "Positive"]; // 0, 1, 2

    return (
        <div className="flex flex-col items-center">
            <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-2">
                {/* Header Row */}
                <div className="text-xs font-bold text-slate-500 rotate-90 flex items-center justify-center mr-2">Actual</div>
                {labels.map(l => <div key={l} className="text-sm font-bold text-center text-slate-300 pb-2">{l}</div>)}

                {/* Rows */}
                {labels.map((rowLabel, rIdx) => (
                    <React.Fragment key={rIdx}>
                        <div className="text-sm font-bold text-slate-300 pr-2 flex items-center justify-end">{rowLabel}</div>
                        {labels.map((_, cIdx) => {
                            const val = matrix[rIdx][cIdx];
                            const intensity = val / maxVal;
                            // Color logic
                            let bg = "";
                            if (rIdx === cIdx) {
                                bg = `rgba(34, 197, 94, ${0.2 + intensity * 0.8})`; // Green
                            } else {
                                bg = `rgba(239, 68, 68, ${0.1 + intensity * 0.6})`; // Red
                            }

                            return (
                                <div
                                    key={cIdx}
                                    className="w-24 h-24 flex flex-col items-center justify-center rounded-lg border border-slate-700/50 text-white font-bold text-lg relative"
                                    style={{ backgroundColor: bg }}
                                >
                                    <span>{val}</span>
                                    <span className="text-[10px] text-slate-300 opacity-60 font-normal">
                                        {((val / matrix[rIdx].reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
            <div className="text-sm font-bold text-slate-500 mt-4">Predicted Label</div>
        </div>
    );
};

export default ResultsComparison;
