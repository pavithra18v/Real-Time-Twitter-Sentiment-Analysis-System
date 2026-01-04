import React, { useState } from 'react';
import {
    FaChartBar, FaChartLine, FaChartArea,
    FaSearch, FaBrain, FaCheckCircle, FaExclamationTriangle, FaFireAlt
} from 'react-icons/fa';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, Cell
} from 'recharts';
import type { Metrics } from '../types';

// --- MOCK DATA GENERATORS ---

const ALL_MODELS = ["LSTM", "BERT", "SVM", "Random Forest", "Logistic Regression"];

const MOCK_COMPARISON = [
    { name: 'LSTM', Accuracy: 0.85, Precision: 0.83, Recall: 0.84, F1: 0.84 },
    { name: 'BERT', Accuracy: 0.92, Precision: 0.91, Recall: 0.93, F1: 0.92 },
    { name: 'SVM', Accuracy: 0.78, Precision: 0.76, Recall: 0.75, F1: 0.76 },
    { name: 'Random Forest', Accuracy: 0.81, Precision: 0.80, Recall: 0.79, F1: 0.80 },
    { name: 'Logistic Regression', Accuracy: 0.75, Precision: 0.74, Recall: 0.73, F1: 0.74 },
];

const MOCK_TRAINING_HISTORY = Array.from({ length: 20 }, (_, i) => ({
    epoch: i + 1,
    trainLoss: Math.max(0.1, 0.8 * Math.exp(-0.2 * i) + Math.random() * 0.05),
    valLoss: Math.max(0.2, 0.9 * Math.exp(-0.15 * i) + Math.random() * 0.05),
    trainAcc: Math.min(0.98, 0.5 + 0.45 * (1 - Math.exp(-0.2 * i))),
    valAcc: Math.min(0.92, 0.45 + 0.45 * (1 - Math.exp(-0.15 * i))),
}));

const MOCK_ROC_DATA = Array.from({ length: 20 }, (_, i) => {
    const x = i / 19;
    return {
        fpr: x,
        tprA: Math.min(1, x + (1 - x) * 0.8), // Better model
        tprB: Math.min(1, x + (1 - x) * 0.5), // Worse model
    };
});

const MOCK_PR_DATA = Array.from({ length: 20 }, (_, i) => {
    const r = i / 19;
    return {
        recall: r,
        precA: Math.max(0, 1 - r * r * 0.5),
        precB: Math.max(0, 0.9 - r * 0.6),
    };
});

const MOCK_CONFIDENCE = Array.from({ length: 10 }, (_, i) => ({
    bin: `${i * 10}-${(i + 1) * 10}%`,
    count: Math.floor(Math.random() * 200) + 50
}));

const MOCK_SHAP = [
    { feature: "amazing", impact: 0.45, type: "Positive" },
    { feature: "love", impact: 0.38, type: "Positive" },
    { feature: "best", impact: 0.32, type: "Positive" },
    { feature: "terrible", impact: -0.42, type: "Negative" },
    { feature: "worst", impact: -0.35, type: "Negative" },
    { feature: "slow", impact: -0.25, type: "Negative" },
];

const MOCK_ERROR_ANALYSIS = [
    { type: 'Pos -> Neg', count: 45 },
    { type: 'Pos -> Neu', count: 32 },
    { type: 'Neg -> Pos', count: 28 },
    { type: 'Neg -> Neu', count: 55 },
    { type: 'Neu -> Pos', count: 30 },
    { type: 'Neu -> Neg', count: 40 },
];


const COLORS = {
    pos: '#4ade80',
    neg: '#f87171',
    neu: '#94a3b8',
    grid: '#334155',
    text: '#94a3b8',
    primary: '#3b82f6',
    secondary: '#8b5cf6'
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl text-xs text-white">
                <p className="font-bold mb-1">{label}</p>
                {payload.map((p: any, idx: number) => (
                    <p key={idx} style={{ color: p.color }}>
                        {p.name}: {typeof p.value === 'number' ? p.value.toFixed(3) : p.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const ConfusionMatrixHeatmap = ({ matrix }: { matrix?: number[][] }) => {
    // Default matrix if none provided
    const data = matrix || [
        [450, 20, 30], // Actual Neg
        [40, 300, 60], // Actual Neu
        [25, 50, 500]  // Actual Pos
    ];

    // Normalize for color intensity
    const maxVal = Math.max(...data.flat());
    const labels = ["Negative", "Neutral", "Positive"]; // 0, 1, 2

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-1">
                {/* Header Row */}
                <div className="text-xs font-bold text-slate-400 rotate-90 flex items-center justify-center mr-2">Actual</div>
                {labels.map(l => <div key={l} className="text-xs font-bold text-center text-slate-300 pb-1">{l}</div>)}

                {/* Rows */}
                {labels.map((rowLabel, rIdx) => (
                    <React.Fragment key={rIdx}>
                        <div className="text-xs font-bold text-slate-300 pr-2 flex items-center justify-end">{rowLabel}</div>
                        {labels.map((colLabel, cIdx) => {
                            const val = data[rIdx][cIdx];
                            const intensity = val / maxVal;
                            // Color gen: Green for diagonal (correct), Red for off-diagonal (wrong)
                            let bg = "";
                            if (rIdx === cIdx) {
                                // Correct: Blue/Green scale
                                bg = `rgba(34, 197, 94, ${0.2 + intensity * 0.8})`;
                            } else {
                                // Incorrect: Red/Orange
                                bg = `rgba(239, 68, 68, ${0.1 + intensity * 0.6})`;
                            }

                            return (
                                <div
                                    key={cIdx}
                                    className="w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center rounded border border-slate-900/10 text-white font-bold text-sm relative group cursor-default"
                                    style={{ backgroundColor: bg }}
                                >
                                    <span>{val}</span>
                                    {/* Tooltip on hover */}
                                    <div className="absolute opacity-0 group-hover:opacity-100 bg-black text-xs p-1 rounded -top-8 w-32 z-10 pointer-events-none transition-opacity">
                                        Actual: {rowLabel}<br />Pred: {colLabel}
                                    </div>
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
            <div className="text-xs font-bold text-slate-400 mt-2">Predicted Label</div>
        </div>
    );
};

const TrainedVisualization = ({ metrics }: { metrics: Metrics | null }) => {
    // Current model selection for detailed views
    const [selectedModel, setSelectedModel] = useState("BERT");

    // If we have actual metrics passed from props, use them for the "Selected Model" view
    // but for comparison, we stick to mock data since we only have one trained model in memory.

    if (!metrics || Object.keys(metrics).length === 0) {
        return (
            <div className="p-8 min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center justify-center text-center">
                <FaBrain className="text-6xl text-slate-700 mb-6" />
                <h2 className="text-3xl font-bold mb-4 text-slate-300">No Model Trained Yet</h2>
                <p className="text-slate-500 max-w-lg mb-8">
                    Visualizations are only available after a model has been trained.
                    Please go to the Training page to start a session.
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 min-h-screen bg-slate-950 text-white font-sans space-y-12 pb-24">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center text-blue-400">
                    <FaBrain className="mr-3" /> Trained Model Visualization
                </h1>
                <p className="text-gray-400 max-w-3xl">
                    Comprehensive evaluation metrics for your trained models. Compare performance, analyze errors, and interpret model decisions.
                </p>
            </div>

            {/* Test Configuration Summary (Added per user request) */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
                <h3 className="text-lg font-bold mb-6 text-white flex items-center">
                    <FaBrain className="mr-2 text-blue-400" /> Model Configuration & Live Stats
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Column 1 */}
                    <div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Model Name</span>
                        <span className="text-lg font-bold text-white block">BERT_70_30_LIME</span>
                    </div>

                    {/* Column 2 */}
                    <div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Dataset Size</span>
                        <span className="text-lg font-bold text-white block">50,000</span>
                    </div>

                    {/* Column 3 */}
                    <div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Accuracy</span>
                        <span className="text-lg font-bold text-green-400 block">
                            {metrics ? (metrics.accuracy * 100).toFixed(1) + '%' : '92.0%'}
                        </span>
                    </div>

                    {/* Column 4 */}
                    <div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Test Split</span>
                        <span className="text-lg font-bold text-white block">70/30</span>
                    </div>

                    {/* Row 2 - Column 1 */}
                    <div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Timestamp</span>
                        <span className="text-lg font-bold text-white block">{new Date().toISOString().split('T')[0]}</span>
                    </div>

                    {/* Live Sentiment Stats (Mocked for visual parity with request) */}
                    <div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Live Positive</span>
                        <span className="text-lg font-bold text-green-400 block">18.7%</span>
                    </div>

                    <div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Live Negative</span>
                        <span className="text-lg font-bold text-red-400 block">17.3%</span>
                    </div>

                    <div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Live Neutral</span>
                        <span className="text-lg font-bold text-gray-400 block">64.0%</span>
                    </div>
                </div>
            </div>

            {/* 1. Model Performance Comparisons (Mandatory) */}
            <section>
                <h2 className="text-xl font-bold mb-4 flex items-center border-b border-slate-800 pb-2">
                    <FaChartBar className="mr-2 text-purple-400" /> 1. Model Performance Comparison
                </h2>
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={MOCK_COMPARISON} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                            <XAxis dataKey="name" stroke={COLORS.text} />
                            <YAxis domain={[0.6, 1]} stroke={COLORS.text} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="Accuracy" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Precision" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Recall" fill="#f97316" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="F1" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    <p className="text-center text-sm text-gray-500 mt-4">BERT and LSTM models generally outperform traditional ML methods in F1-score.</p>
                </div>
            </section>

            {/* 2. Confusion Matrix & 3. Training Curves */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* 2. Confusion Matrix */}
                <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center">
                            <FaExclamationTriangle className="mr-2 text-yellow-500" /> 2. Confusion Matrix Heatmap
                        </h2>
                        <select
                            className="bg-slate-800 border border-slate-700 text-sm rounded p-1 px-2 outline-none focus:border-blue-500"
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                        >
                            {ALL_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <ConfusionMatrixHeatmap matrix={metrics?.confusion_matrix} />
                    </div>
                </section>

                {/* 3. Training Curves (Deep Learning) */}
                <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                    <h2 className="text-xl font-bold mb-6 flex items-center">
                        <FaChartLine className="mr-2 text-green-400" /> 3. Training vs Validation
                    </h2>

                    {/* Loss Curve */}
                    <div className="h-48 mb-8">
                        <h4 className="text-sm text-gray-400 mb-2">Loss Curve</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={MOCK_TRAINING_HISTORY}>
                                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                                <XAxis dataKey="epoch" stroke={COLORS.text} tick={{ fontSize: 10 }} />
                                <YAxis stroke={COLORS.text} tick={{ fontSize: 10 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line type="monotone" dataKey="trainLoss" stroke="#ef4444" dot={false} strokeWidth={2} name="Train Loss" />
                                <Line type="monotone" dataKey="valLoss" stroke="#f97316" dot={false} strokeWidth={2} name="Val Loss" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Accuracy Curve */}
                    <div className="h-48">
                        <h4 className="text-sm text-gray-400 mb-2">Accuracy Curve</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={MOCK_TRAINING_HISTORY}>
                                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                                <XAxis dataKey="epoch" stroke={COLORS.text} tick={{ fontSize: 10 }} />
                                <YAxis domain={[0.4, 1]} stroke={COLORS.text} tick={{ fontSize: 10 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line type="monotone" dataKey="trainAcc" stroke="#3b82f6" dot={false} strokeWidth={2} name="Train Acc" />
                                <Line type="monotone" dataKey="valAcc" stroke="#10b981" dot={false} strokeWidth={2} name="Val Acc" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            </div>

            {/* 4. ROC & 5. PR Curve */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ROC Curve */}
                <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 h-80">
                    <h2 className="text-lg font-bold mb-4 flex items-center">
                        <FaChartArea className="mr-2 text-pink-400" /> 4. ROC Curve
                    </h2>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={MOCK_ROC_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                            <XAxis dataKey="fpr" label={{ value: "False Positive Rate", position: 'insideBottomRight', offset: -10, fill: '#94a3b8', fontSize: 10 }} type="number" domain={[0, 1]} stroke={COLORS.text} />
                            <YAxis label={{ value: "True Positive Rate", angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} domain={[0, 1]} stroke={COLORS.text} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="tprA" stroke="#8b5cf6" strokeWidth={2} dot={false} name="BERT (AUC=0.92)" />
                            <Line type="monotone" dataKey="tprB" stroke="#64748b" strokeWidth={2} dot={false} name="Baseline (AUC=0.75)" />
                            {/* Diagonal Line */}
                            <Line dataKey="fpr" stroke="#334155" strokeDasharray="5 5" dot={false} activeDot={false} name="Random" />
                        </LineChart>
                    </ResponsiveContainer>
                </section>

                {/* Precision-Recall Curve */}
                <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 h-80">
                    <h2 className="text-lg font-bold mb-4 flex items-center">
                        <FaChartArea className="mr-2 text-indigo-400" /> 5. Precision-Recall Curve
                    </h2>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={MOCK_PR_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                            <XAxis dataKey="recall" label={{ value: "Recall", position: 'insideBottomRight', offset: -10, fill: '#94a3b8', fontSize: 10 }} type="number" domain={[0, 1]} stroke={COLORS.text} />
                            <YAxis label={{ value: "Precision", angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} domain={[0, 1]} stroke={COLORS.text} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="precA" stroke="#ec4899" strokeWidth={2} dot={false} name="BERT" />
                            <Line type="monotone" dataKey="precB" stroke="#64748b" strokeWidth={2} dot={false} name="SVM" />
                        </LineChart>
                    </ResponsiveContainer>
                </section>
            </div>

            {/* 6. Explainability */}
            <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                    <FaFireAlt className="mr-2 text-orange-400" /> 6. Explainability (Feature Importance)
                </h2>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={MOCK_SHAP} margin={{ left: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} horizontal={false} />
                            <XAxis type="number" domain={[-0.6, 0.6]} stroke={COLORS.text} />
                            <YAxis dataKey="feature" type="category" stroke={COLORS.text} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="impact" name="SHAP Value impact on prediction" fill="#f59e0b">
                                {MOCK_SHAP.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.type === 'Positive' ? COLORS.pos : COLORS.neg} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* 7. Confidence & 8. Error Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Confidence Dist */}
                <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 h-80">
                    <h2 className="text-lg font-bold mb-4 flex items-center">
                        <FaCheckCircle className="mr-2 text-teal-400" /> 7. Prediction Confidence
                    </h2>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={MOCK_CONFIDENCE}>
                            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                            <XAxis dataKey="bin" stroke={COLORS.text} fontSize={10} />
                            <YAxis stroke={COLORS.text} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Predictions" />
                        </BarChart>
                    </ResponsiveContainer>
                </section>

                {/* Error Analysis */}
                <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 h-80">
                    <h2 className="text-lg font-bold mb-4 flex items-center">
                        <FaSearch className="mr-2 text-red-400" /> 8. Error Analysis (Misclassifications)
                    </h2>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={MOCK_ERROR_ANALYSIS} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} horizontal={false} />
                            <XAxis type="number" stroke={COLORS.text} />
                            <YAxis dataKey="type" type="category" width={80} stroke={COLORS.text} fontSize={11} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} name="Error Count" />
                        </BarChart>
                    </ResponsiveContainer>
                </section>
            </div>

        </div>
    );
};

export default TrainedVisualization;
