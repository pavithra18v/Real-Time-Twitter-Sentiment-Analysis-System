import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { FaChartLine, FaTwitter, FaDatabase, FaCogs, FaHome, FaTable, FaBalanceScale } from 'react-icons/fa';

import {
  Dashboard,
  Datasets,
  ModelTraining,
  TrainedVisualization,
  LiveTwitterAnalysis,
  LiveResults,
  ResultsComparison,
  ModelBenchmarks
} from './pages';
import type { Dataset, Metrics } from './types';
import { resetSystem } from './services/api';

function App() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [modelConfig, setModelConfig] = useState({ modelType: 'LSTM', explainMethod: 'LIME' });
  const [liveResults, setLiveResults] = useState<any[]>([]); // Lifted state for live results

  useEffect(() => {
    // Session Reset on App Start
    resetSystem().then(() => console.log('System Reset Complete: Fresh Session Started'));
  }, []);

  return (
    <Router>
      <div className="flex h-screen bg-slate-950 text-slate-50 font-sans">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col shadow-xl z-20">
          <div className="p-6 text-2xl font-bold border-b border-slate-800 flex items-center gap-2">
            <span className="text-blue-500">Sentiment</span>AI
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <NavItem to="/" icon={<FaHome />} label="Dashboard" />
            <NavItem to="/datasets" icon={<FaDatabase />} label="Datasets" />
            <NavItem to="/training" icon={<FaCogs />} label="Model Training" />
            <NavItem to="/visualization" icon={<FaChartLine />} label="Visualization" />
            <NavItem to="/live-twitter" icon={<FaTwitter />} label="Live Twitter" />
            <NavItem to="/live-results" icon={<FaTable />} label="Live Results" />
            <NavItem to="/comparison" icon={<FaTable />} label="Comparison" />
            <NavItem to="/benchmarks" icon={<FaBalanceScale />} label="Model Baseline" />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/datasets" element={<Datasets datasets={datasets} setDatasets={setDatasets} />} />
            <Route path="/training" element={<ModelTraining datasets={datasets} setMetrics={setMetrics} modelConfig={modelConfig} setModelConfig={setModelConfig} />} />
            <Route path="/visualization" element={<TrainedVisualization metrics={metrics} />} />
            <Route path="/live-twitter" element={<LiveTwitterAnalysis modelConfig={modelConfig} setLiveResults={setLiveResults} />} />
            <Route path="/live-results" element={<LiveResults results={liveResults} modelConfig={modelConfig} />} />
            <Route path="/comparison" element={<ResultsComparison metrics={metrics} modelConfig={modelConfig} />} />
            <Route path="/benchmarks" element={<ModelBenchmarks metrics={metrics} modelConfig={modelConfig} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
  <Link to={to} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-600 transition-all duration-200 group">
    <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
    <span className="font-medium">{label}</span>
  </Link>
);

export default App;
