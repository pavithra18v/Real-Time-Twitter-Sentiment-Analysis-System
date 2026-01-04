import React, { useState, useEffect } from 'react';
import { analyzeTwitter } from '../services/api';
import { FaTwitter, FaSearch, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import TweetList from '../components/TweetList';

interface LiveTwitterAnalysisProps {
    modelConfig?: { modelType: string, explainMethod: string };
    setLiveResults: React.Dispatch<React.SetStateAction<any[]>>;
}

const LiveTwitterAnalysis = ({ modelConfig, setLiveResults }: LiveTwitterAnalysisProps) => {
    const [keyword, setKeyword] = useState('');
    const [tweetCount, setTweetCount] = useState(100);
    // Use props as initial value or default
    const [modelType, setModelType] = useState(modelConfig?.modelType || 'BERT');
    const [explainMethod, setExplainMethod] = useState(modelConfig?.explainMethod || 'LIME');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]); // Local findings state

    // Sync with props if they change (optional, depending on user preference)
    useEffect(() => {
        if (modelConfig) {
            setModelType(modelConfig.modelType);
            setExplainMethod(modelConfig.explainMethod);
        }
    }, [modelConfig]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const data = await analyzeTwitter({
                keyword,
                count: tweetCount,
                model_type: modelType,
                explainability_method: explainMethod
            });

            // Set local results
            setResults(data);
            // Update global state for Live Results page
            setLiveResults(data);


        } catch (error: any) {
            console.error("Error fetching tweets:", error);
            if (error.response && error.response.status === 429) {
                alert("⚠️ Twitter API Alert: Rate limit exceeded. Keys will be blocked due to excessive usage.");
            } else if (error.message && error.message.includes("429")) {
                alert("⚠️ Twitter API Alert: Rate limit exceeded. Keys will be blocked due to excessive usage.");
            } else {
                alert("Error analyzing tweets. Check backend logs.");
            }
        }
        setLoading(false);
    };

    return (
        <div className="p-8 min-h-screen bg-slate-950 text-white font-sans relative overflow-hidden">

            {/* Animated Blue Bird */}
            <motion.div
                className="absolute text-blue-400 text-4xl opacity-50 pointer-events-none"
                animate={{
                    x: [0, 400, 800, 200, 0],
                    y: [0, 100, 0, 300, 0],
                    rotate: [0, 10, -10, 5, 0]
                }}
                transition={{
                    duration: 20,
                    ease: "linear",
                    repeat: Infinity
                }}
                initial={{ x: 50, y: 50 }}
            >
                <FaTwitter />
            </motion.div>

            <h1 className="text-3xl font-bold mb-6 flex items-center relative z-10">
                <FaTwitter className="text-blue-400 mr-3" /> Live Twitter Analysis
            </h1>

            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 shadow-xl backdrop-blur-sm mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Keyword</label>
                        <input
                            type="text"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500"
                            placeholder="#SentimentAnalysis"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                    {/* Display currently active model config (read-only) */}
                    <div>
                        <div className="flex flex-col space-y-1">
                            <span className="text-xs text-gray-400">Target Model</span>
                            <span className="font-bold text-blue-400 border border-slate-700 bg-slate-800 px-3 py-2 rounded">{modelType}</span>
                        </div>
                    </div>
                    <div>
                        <div className="flex flex-col space-y-1">
                            <span className="text-xs text-gray-400">Explainability</span>
                            <span className="font-bold text-purple-400 border border-slate-700 bg-slate-800 px-3 py-2 rounded">{explainMethod}</span>
                        </div>
                    </div>

                    <div className="lg:col-span-4 flex space-x-2 mt-4">
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className={`flex-1 text-white p-3 rounded-lg font-bold transition flex items-center justify-center shadow-lg ${loading ? 'bg-slate-700 cursor-not-allowed text-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaSearch className="mr-2" />}
                            Analyze Tweets
                        </button>
                    </div>
                </div>
            </div>

            {/* Live Results Display - MOVED to separate page per requirement */}
            <TweetList results={results} />

            {results.length === 0 && !loading && (
                <div className="text-center text-gray-500 italic mt-8">
                    Results will appear here after analysis.
                </div>
            )}

        </div>
    );
};

export default LiveTwitterAnalysis;
