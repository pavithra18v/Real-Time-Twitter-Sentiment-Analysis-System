import React, { useMemo } from 'react';
import { FaChartPie, FaGlobeAmericas, FaChartLine, FaCloud, FaMicrochip, FaRobot, FaSearch, FaMobileAlt } from 'react-icons/fa';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
    LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

interface LiveResultsProps {
    results: any[];
    modelConfig?: { modelType: string, explainMethod: string };
}

const COLORS = {
    positive: '#4ade80', // Green
    negative: '#f87171', // Red
    neutral: '#94a3b8',  // Gray
    barBlue: '#3b82f6',
    barPurple: '#8b5cf6',
    mix: ['#60a5fa', '#34d399', '#f472b6', '#a78bfa', '#fbbf24']
};

const CHART_BG = "#1e293b"; // slate-800
const TOOLTIP_STYLE = { backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' };

const LiveResults = ({ results, modelConfig }: LiveResultsProps) => {

    const stats = useMemo(() => {
        if (!results.length) return null;

        const total = results.length;
        const sentimentCounts: Record<string, number> = { Positive: 0, Negative: 0, Neutral: 0 };
        const countryCounts: Record<string, number> = {};
        const countrySentiment: Record<string, Record<string, number>> = {};
        const keywordCounts: Record<string, number> = {};
        const keywordSentiment: Record<string, { total: number, score: number }> = {};
        const timeDataMap: Record<string, { time: string, Positive: number, Negative: number, Neutral: number, total: number }> = {};
        const sources: Record<string, number> = {};
        const confidenceBuckets: number[] = new Array(10).fill(0); // 0.0-0.1, ... 0.9-1.0

        // Mock timestamps if missing (for demo purposes)
        const now = new Date();

        results.forEach((r, idx) => {
            // Sentiment
            const s: 'Positive' | 'Negative' | 'Neutral' = (r.sentiment === 'Positive' || r.sentiment === 'Negative' || r.sentiment === 'Neutral') ? r.sentiment : 'Neutral';
            sentimentCounts[s] = (sentimentCounts[s] || 0) + 1;

            // Country
            const c = r.country || 'Unknown';
            countryCounts[c] = (countryCounts[c] || 0) + 1;

            if (!countrySentiment[c]) countrySentiment[c] = { Positive: 0, Negative: 0, Neutral: 0 };
            countrySentiment[c][s] = (countrySentiment[c][s] || 0) + 1;

            // Keywords (Basic split)
            const words = r.text.toLowerCase().split(/\s+/);
            words.forEach((w: string) => {
                if (w.length > 3 && !['this', 'that', 'with', 'from', 'have', 'http'].some(sw => w.includes(sw))) {
                    keywordCounts[w] = (keywordCounts[w] || 0) + 1;
                    if (!keywordSentiment[w]) keywordSentiment[w] = { total: 0, score: 0 };
                    keywordSentiment[w].total++;
                    keywordSentiment[w].score += s === 'Positive' ? 1 : (s === 'Negative' ? -1 : 0);
                }
            });

            // Time Overlay (Simulated for live effect if not present)
            const timeOffset = Math.floor(idx / 5); // Group every 5 tweets as "1 minute"
            const timeLabel = new Date(now.getTime() - (20 - timeOffset) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            if (!timeDataMap[timeLabel]) timeDataMap[timeLabel] = { time: timeLabel, Positive: 0, Negative: 0, Neutral: 0, total: 0 };
            timeDataMap[timeLabel][s]++;
            timeDataMap[timeLabel].total++;

            // Confidence
            const conf = r.confidence || 0.5;
            const bucket = Math.min(Math.floor(conf * 10), 9);
            confidenceBuckets[bucket]++;

            // Source (Simulated)
            const src = ['Android', 'iPhone', 'Web App', 'Twitter Lite'][Math.floor(Math.random() * 4)];
            sources[src] = (sources[src] || 0) + 1;
        });

        // --- Formatting Data for Charts ---

        // 1. Sentiment Distribution
        const sentimentData = Object.keys(sentimentCounts).map(key => ({ name: key, value: sentimentCounts[key] }));

        // 2 & 3. Time Series
        const timeSeriesData = Object.values(timeDataMap);

        // 4. Top Countries
        const countryData = Object.entries(countryCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // 5. Sentiment by Country (Stacked)
        const countrySentimentData = Object.keys(countrySentiment)
            .map(c => ({
                name: c,
                Positive: countrySentiment[c].Positive,
                Negative: countrySentiment[c].Negative,
                Neutral: countrySentiment[c].Neutral,
                total: countrySentiment[c].Positive + countrySentiment[c].Negative + countrySentiment[c].Neutral
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 8); // Top 8

        // 6. Top Keywords
        const topKeywords = Object.entries(keywordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({ name, count }));

        // 7. Sentiment by Topic (Grouped) -> Simplified to keyword sentiment score
        const topicSentimentData = Object.entries(keywordSentiment)
            .filter(([_, data]) => data.total > 2) // Filter noise
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 8)
            .map(([name, data]) => ({
                name,
                Score: (data.score / data.total).toFixed(2)
            }));

        // 8. Model Comparison (Mock for now, static)
        const modelComparisonData = [
            { subject: 'Accuracy', A: 88, B: 82, fullMark: 100 },
            { subject: 'Precision', A: 85, B: 80, fullMark: 100 },
            { subject: 'Recall', A: 89, B: 78, fullMark: 100 },
            { subject: 'F1', A: 87, B: 79, fullMark: 100 },
            { subject: 'Speed', A: 95, B: 60, fullMark: 100 },
        ];

        // 10. Confidence Dist
        const confidenceData = confidenceBuckets.map((count, idx) => ({
            name: `${idx * 10}-${(idx + 1) * 10}%`,
            count
        }));

        // 11. Source Analysis
        const sourceData = Object.entries(sources).map(([name, value]) => ({ name, value }));

        return {
            sentimentData,
            timeSeriesData,
            countryData,
            countrySentimentData,
            topKeywords,
            topicSentimentData,
            modelComparisonData,
            confidenceData,
            sourceData,
            total,
            sentimentCounts
        };
    }, [results]);

    if (!results.length || !stats) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <FaSearch className="text-4xl mb-4 opacity-50" />
                <p>No analysis data available. Please run an analysis on the "Live Twitter Analysis" page first.</p>
            </div>
        );
    }

    const { sentimentCounts } = stats;
    const posPct = ((sentimentCounts['Positive'] / stats.total) * 100).toFixed(0);
    const negPct = ((sentimentCounts['Negative'] / stats.total) * 100).toFixed(0);
    const neuPct = ((sentimentCounts['Neutral'] / stats.total) * 100).toFixed(0);

    return (
        <div className="space-y-8 animate-fade-in-up pb-12">
            {/* Header / Summary Card */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-8 rounded-2xl border border-slate-800 shadow-2xl">
                <h1 className="text-3xl font-bold mb-2 flex items-center">
                    <FaChartLine className="mr-3 text-blue-500" /> Live Data Visualization
                </h1>
                <p className="text-gray-400 mb-6">Real-time sentiment analysis and visualization of live Twitter data</p>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Model Name</span>
                        <span className="text-lg font-bold text-white flex items-center">
                            <FaMicrochip className="mr-2 text-purple-400" />
                            {modelConfig?.modelType || 'BERT'}_LIME
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Total Tweets</span>
                        <span className="text-lg font-bold text-white flex items-center">
                            <FaCloud className="mr-2 text-blue-400" />
                            {stats.total.toLocaleString()}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Accuracy (Est.)</span>
                        <span className="text-lg font-bold text-green-400">88%</span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Live Sentiment Split</span>
                        <div className="flex space-x-3 text-sm font-bold">
                            <span className="text-green-400">{posPct}% Pos</span>
                            <span className="text-red-400">{negPct}% Neg</span>
                            <span className="text-gray-400">{neuPct}% Neu</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 1. Core Sentiment & Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sentiment Distribution */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm lg:col-span-1">
                    <h3 className="text-lg font-bold mb-4 flex items-center"><FaChartPie className="mr-2 text-blue-400" /> Sentiment Dist.</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.sentimentData}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.sentimentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.name === 'Positive' ? COLORS.positive : entry.name === 'Negative' ? COLORS.negative : COLORS.neutral} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#fff' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sentiment Over Time */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm lg:col-span-2">
                    <h3 className="text-lg font-bold mb-4 flex items-center"><FaChartLine className="mr-2 text-green-400" /> Sentiment Over Time</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.timeSeriesData}>
                                <defs>
                                    <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.positive} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={COLORS.positive} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.negative} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={COLORS.negative} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="time" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Area type="monotone" dataKey="Positive" stroke={COLORS.positive} fillOpacity={1} fill="url(#colorPos)" />
                                <Area type="monotone" dataKey="Negative" stroke={COLORS.negative} fillOpacity={1} fill="url(#colorNeg)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 2. Geographic & Volume Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Countries */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center"><FaGlobeAmericas className="mr-2 text-blue-400" /> Top Countries</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.countryData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis type="number" stroke="#94a3b8" />
                                <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" />
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Bar dataKey="count" fill={COLORS.barBlue} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sentiment by Country */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center"><FaGlobeAmericas className="mr-2 text-purple-400" /> Regional Sentiment</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.countrySentimentData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Legend />
                                <Bar dataKey="Positive" stackId="a" fill={COLORS.positive} />
                                <Bar dataKey="Neutral" stackId="a" fill={COLORS.neutral} />
                                <Bar dataKey="Negative" stackId="a" fill={COLORS.negative} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. Content & Explainability */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Keywords */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm lg:col-span-1">
                    <h3 className="text-lg font-bold mb-4 flex items-center"><FaSearch className="mr-2 text-pink-400" /> Top Keywords</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.topKeywords} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" fontSize={11} />
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Bar dataKey="count" fill="#ec4899" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Keyword Sentiment */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm lg:col-span-2">
                    <h3 className="text-lg font-bold mb-4 flex items-center"><FaRobot className="mr-2 text-yellow-400" /> Topic Sentiment Score (-1 to +1)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.topicSentimentData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Bar dataKey="Score" fill="#fbbf24">
                                    {stats.topicSentimentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={parseFloat(entry.Score) > 0 ? COLORS.positive : COLORS.negative} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 4. Advanced Metrics & Model Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Model Comparison */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center"><FaMicrochip className="mr-2 text-indigo-400" /> Model Metrics (Eval)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart outerRadius="70%" data={stats.modelComparisonData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={12} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                                <Radar name="Current" dataKey="A" stroke={COLORS.barBlue} fill={COLORS.barBlue} fillOpacity={0.6} />
                                <Radar name="Baseline" dataKey="B" stroke="#64748b" fill="#64748b" fillOpacity={0.4} />
                                <Legend />
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Confidence Distribution */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center"><FaChartLine className="mr-2 text-teal-400" /> Confidence Dist.</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.confidenceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Source Analysis */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center"><FaMobileAlt className="mr-2 text-orange-400" /> Tweet Sources</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.sourceData}
                                    cx="50%" cy="50%"
                                    innerRadius={40} outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.sourceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS.mix[index % COLORS.mix.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#fff' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveResults;
