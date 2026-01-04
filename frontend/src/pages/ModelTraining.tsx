import React, { useState } from 'react';
import { FaCogs, FaPlay } from 'react-icons/fa';
import { trainModel } from '../services/api';
import type { Dataset, Metrics } from '../types';
import { useNavigate } from 'react-router-dom';

interface ModelTrainingProps {
    datasets: Dataset[];
    setMetrics: React.Dispatch<React.SetStateAction<Metrics | null>>;
    modelConfig: { modelType: string, explainMethod: string };
    setModelConfig: React.Dispatch<React.SetStateAction<{ modelType: string, explainMethod: string }>>;
}

const ModelTraining = ({ datasets, setMetrics, modelConfig, setModelConfig }: ModelTrainingProps) => {
    // Local state for split since it's training-specific
    const [splitRatio, setSplitRatio] = useState(0.8);
    const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
    const [isTraining, setIsTraining] = useState(false);
    const navigate = useNavigate();

    const selectedModel = modelConfig.modelType;
    const explainMethod = modelConfig.explainMethod;

    const setSelectedModel = (model: string) => setModelConfig(prev => ({ ...prev, modelType: model }));
    const setExplainMethod = (method: string) => setModelConfig(prev => ({ ...prev, explainMethod: method }));

    const toggleDataset = (name: string) => {
        if (selectedDatasets.includes(name)) {
            setSelectedDatasets(selectedDatasets.filter(d => d !== name));
        } else {
            setSelectedDatasets([...selectedDatasets, name]);
        }
    };

    const handleTrain = async () => {
        if (selectedDatasets.length < 3) {
            alert("❌ Minimum 3 datasets are required for training");
            return;
        }
        setIsTraining(true);
        try {
            // Correct API Routes:
            // Deep Learning: /models/deep-learning
            // Classical: /classical/classical
            const isDeepLearning = ["LSTM", "BERT"].includes(selectedModel);
            const endpoint = isDeepLearning ? "/models/deep-learning" : "/classical/classical";

            const response = await trainModel(endpoint, {
                model_type: selectedModel as any,
                explainability_method: explainMethod as any,
                split_ratio: splitRatio,
                dataset_filenames: selectedDatasets
            });

            if (response && response.metrics) {
                setMetrics(response.metrics);
            } else {
                console.log("Training response:", response);
            }

            alert("Training started successfully! Redirecting to visualization...");
            setTimeout(() => navigate('/visualization'), 1000);

        } catch (error) {
            console.error("Training failed:", error);
            alert("Training failed to start.");
        }
        setIsTraining(false);
    };

    return (
        <div className="p-8 min-h-screen bg-slate-950 text-white font-sans">
            <h1 className="text-3xl font-bold mb-8 flex items-center">
                <FaCogs className="text-blue-500 mr-3" /> Model Training
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 shadow-xl backdrop-blur-sm space-y-6">
                    <h2 className="text-xl font-bold border-b border-slate-700 pb-2 text-blue-400">Configuration</h2>

                    <div>
                        <label className="block font-medium mb-2 text-gray-300">Model Type</label>
                        <select
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                        >
                            <option value="LSTM">LSTM</option>
                            <option value="BERT">BERT</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-medium mb-2 text-gray-300">Explainability Method</label>
                        <div className="flex space-x-4">
                            {['LIME', 'SHAP'].map(m => (
                                <button
                                    key={m}
                                    onClick={() => setExplainMethod(m)}
                                    className={`px-4 py-2 rounded border transition-colors ${explainMethod === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-800 text-gray-400 border-slate-700 hover:bg-slate-700'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block font-medium mb-2 text-gray-300">Train/Test Split</label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="range" min="0.5" max="0.9" step="0.1"
                                value={splitRatio}
                                onChange={(e) => setSplitRatio(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="font-mono bg-slate-800 px-3 py-1 rounded text-blue-300 border border-slate-700">
                                {(splitRatio * 100).toFixed(0)} / {((1 - splitRatio) * 100).toFixed(0)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Dataset Selection */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 shadow-xl backdrop-blur-sm">
                    <h2 className="text-xl font-bold border-b border-slate-700 pb-2 mb-4 text-purple-400">Select Datasets (Min 3)</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {datasets.map(ds => (
                            <label key={ds.id} className="flex items-center space-x-3 p-3 border border-slate-700 rounded bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={selectedDatasets.includes(ds.name)}
                                    onChange={() => toggleDataset(ds.name)}
                                    className="w-5 h-5 text-blue-600 rounded bg-slate-700 border-slate-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-200 flex-1">{ds.name}</span>
                                <span className="text-xs text-gray-500 font-mono">({ds.rows.toLocaleString()} rows)</span>
                            </label>
                        ))}
                        {datasets.length === 0 && (
                            <p className="text-gray-500 italic text-center py-4">No datasets available. Go to Datasets page to upload.</p>
                        )}
                    </div>
                    {datasets.length > 0 && selectedDatasets.length < 3 && (
                        <p className="text-red-400 text-sm mt-4 font-medium flex items-center bg-red-900/20 p-2 rounded">
                            Please select {3 - selectedDatasets.length} more dataset(s).
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <button
                    onClick={handleTrain}
                    disabled={isTraining}
                    className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl text-lg font-bold flex items-center hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-900/50 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isTraining ? (
                        <>Processing...</>
                    ) : (
                        <><FaPlay className="mr-3" /> Start Training Model</>
                    )}
                </button>
            </div>
        </div >
    );
};

export default ModelTraining;
