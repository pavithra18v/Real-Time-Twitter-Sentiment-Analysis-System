import type { Dataset } from '../types';
import React from 'react';
import { FaUpload, FaDatabase, FaTrash } from 'react-icons/fa';

interface DatasetsProps {
    datasets: Dataset[];
    setDatasets: React.Dispatch<React.SetStateAction<Dataset[]>>;
}

const Datasets = ({ datasets, setDatasets }: DatasetsProps) => {

    const handleUpload = () => {
        // Placeholder for upload logic
        alert("Upload functionality would go here.");
    };

    return (
        <div className="p-8 min-h-screen bg-slate-950 text-white font-sans">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold flex items-center">
                    <FaDatabase className="text-purple-400 mr-3" /> Datasets
                </h1>
                <label className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-700 transition cursor-pointer shadow-lg shadow-blue-900/50">
                    <FaUpload className="mr-2" />
                    <span>Upload CSV / TXT</span>
                    <input
                        type="file"
                        accept=".csv,.txt"
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                const newDatasets: Dataset[] = [];
                                for (let i = 0; i < e.target.files.length; i++) {
                                    const file = e.target.files[i];
                                    let rows = 0;
                                    try {
                                        const text = await file.text();
                                        rows = text.split('\n').filter(line => line.trim() !== '').length;
                                        if (file.name.endsWith('.csv')) rows = Math.max(0, rows - 1);
                                    } catch (err) {
                                        console.error("Error reading file:", err);
                                    }
                                    newDatasets.push({
                                        id: Date.now() + i,
                                        name: file.name,
                                        rows: rows,
                                        date: new Date().toISOString().split('T')[0]
                                    });
                                }
                                setDatasets(prev => [...prev, ...newDatasets]);
                            }
                        }}
                    />
                </label>
            </div>

            <div className="bg-slate-900/50 rounded-xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
                <table className="min-w-full text-left">
                    <thead className="bg-slate-900 border-b border-slate-800">
                        <tr>
                            <th className="p-4 font-semibold text-gray-400">Filename</th>
                            <th className="p-4 font-semibold text-gray-400">Rows</th>
                            <th className="p-4 font-semibold text-gray-400">Date Uploaded</th>
                            <th className="p-4 font-semibold text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {datasets.map((ds) => (
                            <tr key={ds.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="p-4 font-medium text-gray-200">{ds.name}</td>
                                <td className="p-4 text-gray-400 font-mono">{ds.rows.toLocaleString()}</td>
                                <td className="p-4 text-gray-400">{ds.date}</td>
                                <td className="p-4">
                                    <button className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-900/20 rounded-full">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {datasets.length === 0 && (
                    <div className="p-12 text-center text-gray-500 italic bg-gray-900/10">
                        No datasets uploaded yet. Upload at least 3 datasets to start training.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Datasets;
