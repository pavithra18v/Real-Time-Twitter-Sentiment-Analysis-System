import React from 'react';
import { FaTable, FaFileCsv } from 'react-icons/fa';

interface TweetListProps {
    results: any[];
}

const TweetList = ({ results }: TweetListProps) => {
    const handleDownload = () => {
        if (results.length === 0) return;

        // Convert results to CSV format
        const headers = "User ID,Username,Country,Text,Sentiment,Confidence\n";
        const rows = results.map(res => {
            // Escape quotes and wrap text in quotes to handle commas within text
            const safeText = `"${res.text.replace(/"/g, '""')}"`;
            return `${res.user_id || ''},${res.username || ''},${res.country || ''},${safeText},${res.sentiment},${res.confidence}`;
        }).join("\n");

        const csvContent = headers + rows;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Use ISO string but replace colons to make it filename safe
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        a.download = `twitter_analysis_${timestamp}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (results.length === 0) return null;

    return (
        <div className="space-y-4 mt-8 animate-fade-in-up">
            <div className="flex justify-between items-center relative z-20">
                <h3 className="text-xl font-bold flex items-center text-white">
                    <FaTable className="text-blue-400 mr-2" /> Recent Tweets
                </h3>
                <button
                    onClick={handleDownload}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold flex items-center hover:bg-green-700 transition shadow-lg"
                >
                    <FaFileCsv className="mr-2" /> Download CSV
                </button>
            </div>

            <div className="space-y-4">
                {results.map((res: any, idx: number) => (
                    <div key={idx} className="bg-slate-900/50 p-4 rounded-xl shadow border-l-4 border-green-500 backdrop-blur-sm">
                        {/* User Details Header */}
                        <div className="flex justify-between items-start mb-3 border-b border-slate-800 pb-2">
                            <div className="flex flex-col">
                                <span className="font-bold text-blue-400">{res.username || 'Unknown User'}</span>
                                <span className="text-xs text-gray-500">ID: {res.user_id || 'N/A'}</span>
                            </div>
                            <span className="text-xs text-gray-400 bg-slate-800 px-2 py-1 rounded-full">
                                {res.country || 'Global'}
                            </span>
                        </div>

                        <p className="text-lg text-gray-200 mb-3">{res.text}</p>
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold px-2 py-1 bg-green-900/30 text-green-400 rounded border border-green-900/50">
                                {res.sentiment}
                            </span>
                            <span className="text-gray-400 font-mono">Confidence: {(res.confidence * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TweetList;
