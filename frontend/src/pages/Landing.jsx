import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardLatest, getModelInfo } from "../api/api";
import {
  Activity,
  Cpu,
  Database,
  Upload,
  BarChart3,
  Shield,
  Layers,
  LineChart,
  Network,
  ArrowRight,
  Zap,
  CheckCircle2
} from "lucide-react";

const Landing = () => {
  const [modelInfo, setModelInfo] = useState(null);
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [hoveredRegime, setHoveredRegime] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const infoRes = await getModelInfo();
        if (!cancelled) setModelInfo(infoRes.data || infoRes);
      } catch {
        // ignore
      }

      try {
        const dashRes = await getDashboardLatest();
        const payload = dashRes.data;
        const last = payload?.summary
          ? {
              aqi: payload.summary.current_aqi,
              regime: payload.summary.current_regime,
              confidence: payload.summary.confidence,
            }
          : null;
        if (!cancelled) setLatestPrediction(last);
      } catch {
        // ignore
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  const normalizeRegime = (raw) => {
    const r = String(raw || "").toLowerCase();
    if (r === "stable") return "stable";
    if (r === "high" || r === "high_volatile") return "high";
    if (r === "volatile" || r === "unstable_low" || r === "moderate") return "volatile";
    if (r.includes("high")) return "high";
    if (r.includes("volatile")) return "volatile";
    return "stable";
  };

  const getRegimeColor = (regime) => {
    const r = normalizeRegime(regime);
    if (r === "stable") return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (r === "volatile") return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    if (r === "high") return "text-rose-400 border-rose-500/30 bg-rose-500/10";
    return "text-slate-400 border-slate-500/30 bg-slate-500/10";
  };

  const confidencePct =
    latestPrediction?.confidence !== undefined && latestPrediction?.confidence !== null
      ? `${(Number(latestPrediction.confidence) * 100).toFixed(1)}%`
      : "—";
  const currentAqi =
    latestPrediction?.aqi !== undefined && latestPrediction?.aqi !== null
      ? Number(latestPrediction.aqi).toFixed(0)
      : "—";

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* Decorative Glow Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[400px] left-[-200px] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* ================= NAVBAR ================= */}
      <nav className="w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 md:px-12 xl:px-24 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all">
            <Activity size={16} className="text-white animate-pulse" />
          </div>
          <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Aero<span className="text-blue-500">Metrics</span>
          </span>
        </div>

        {/* Links */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-400">
          <span className="hover:text-white transition-colors cursor-pointer">HMM Engine</span>
          <span className="hover:text-white transition-colors cursor-pointer">Methodology</span>
          <span className="hover:text-white transition-colors cursor-pointer">API Reference</span>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xs font-bold rounded-lg group bg-gradient-to-br from-blue-600 to-indigo-500 group-hover:from-blue-600 group-hover:to-indigo-500 hover:text-white text-white focus:ring-4 focus:outline-none focus:ring-blue-800 transition"
          >
            <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-slate-950 rounded-md group-hover:bg-opacity-0">
              Launch Dashboard
            </span>
          </Link>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <header className="px-6 md:px-12 xl:px-24 pt-16 md:pt-24 pb-20 md:pb-32 max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20 justify-between items-center">
        
        {/* Left Info Column */}
        <div className="max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <Zap size={12} className="animate-bounce text-blue-400" />
            <span>HMM-Driven Regime Classification v2.4</span>
          </div>

          <h1 className="text-4xl md:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Decode Hidden
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Pollution Regimes
            </span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
            Analyze time-series environmental data using sequence-based 
            <strong> Hidden Markov Models (HMM)</strong>. Automatically isolate stable, 
            volatile, and critical micro-climates from complex air sensor streams.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap gap-4 mb-10">
            <Link
              to="/upload"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all hover:-translate-y-0.5 group"
            >
              <Upload size={16} />
              Ingest Dataset
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/dashboard"
              className="flex items-center gap-2 border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 hover:text-white font-bold text-sm px-7 py-3.5 rounded-xl transition-all"
            >
              <LineChart size={16} />
              View Dashboard
            </Link>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 max-w-lg border border-slate-900 bg-slate-950/40 backdrop-blur p-4 rounded-2xl">
            <div className="border-r border-slate-900 pr-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Latest AQI
              </span>
              <span className="text-xl font-black text-white">{currentAqi}</span>
            </div>
            <div className="border-r border-slate-900 px-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Classification
              </span>
              <span className="text-xl font-black text-white capitalize">
                {latestPrediction ? normalizeRegime(latestPrediction.regime) : "—"}
              </span>
            </div>
            <div className="pl-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Model Confidence
              </span>
              <span className="text-xl font-black text-white">{confidencePct}</span>
            </div>
          </div>
        </div>

        {/* Right Graphic Column (HMM Dashboard Mockup) */}
        <div className="relative w-full max-w-lg group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-all" />
          
          <div className="relative border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-6 rounded-2xl shadow-2xl flex flex-col">
            {/* Window header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
              </div>
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                hmm_state_machine.json
              </span>
            </div>

            {/* Model Card Detail */}
            <div className="border border-slate-800 bg-slate-950/80 p-6 rounded-xl mb-4 flex flex-col items-center justify-center min-h-[220px]">
              {modelInfo ? (
                <>
                  <div className="flex items-center gap-2 border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 text-[10px] font-extrabold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                    <Cpu size={10} className="animate-spin" />
                    Model Live
                  </div>
                  <div className="text-2xl font-black text-white mb-2">
                    Gaussian HMM ({modelInfo.n_states} States)
                  </div>
                  <div className="text-sm text-slate-400 flex items-center gap-2">
                    Latest classification:{" "}
                    {latestPrediction ? (
                      <span className={`px-2 py-0.5 rounded text-xs font-bold border capitalize ${getRegimeColor(latestPrediction.regime)}`}>
                        {normalizeRegime(latestPrediction.regime)}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-semibold">Ready</span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Network size={36} className="text-slate-600 mb-4 stroke-[1.5]" />
                  <div className="text-lg font-bold text-white mb-1">
                    No Active HMM Model
                  </div>
                  <p className="text-xs text-slate-500 text-center max-w-[280px]">
                    Deploy and configure your first Hidden Markov Model by uploading a CSV.
                  </p>
                </>
              )}
            </div>

            {/* Simulated graph or HMM transition states visualization */}
            <div className="bg-slate-950/50 border border-slate-900 p-4 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                  Transitions &amp; Probabilities
                </span>
                <span className="text-xs font-bold text-blue-400">HMM Engine v2</span>
              </div>
              
              {/* Dynamic HMM Transition Mockup */}
              <div className="flex justify-around items-center py-2 relative">
                {/* State 1 */}
                <div 
                  className={`relative z-10 w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center transition-all ${
                    hoveredRegime === 'stable' 
                      ? 'border-emerald-400 bg-emerald-950/80 scale-110 shadow-lg shadow-emerald-500/10' 
                      : 'border-slate-800 bg-slate-900'
                  }`}
                  onMouseEnter={() => setHoveredRegime('stable')}
                  onMouseLeave={() => setHoveredRegime(null)}
                >
                  <span className="text-[9px] font-bold text-slate-500 uppercase">S1</span>
                  <span className="text-[10px] font-black text-emerald-400">Stable</span>
                </div>
                {/* Arrow */}
                <div className="h-0.5 bg-gradient-to-r from-emerald-500 to-amber-500 flex-1 mx-2 relative opacity-50" />
                {/* State 2 */}
                <div 
                  className={`relative z-10 w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center transition-all ${
                    hoveredRegime === 'volatile' 
                      ? 'border-amber-400 bg-amber-950/80 scale-110 shadow-lg shadow-amber-500/10' 
                      : 'border-slate-800 bg-slate-900'
                  }`}
                  onMouseEnter={() => setHoveredRegime('volatile')}
                  onMouseLeave={() => setHoveredRegime(null)}
                >
                  <span className="text-[9px] font-bold text-slate-500 uppercase">S2</span>
                  <span className="text-[10px] font-black text-amber-400">Volat</span>
                </div>
                {/* Arrow */}
                <div className="h-0.5 bg-gradient-to-r from-amber-500 to-rose-500 flex-1 mx-2 relative opacity-50" />
                {/* State 3 */}
                <div 
                  className={`relative z-10 w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center transition-all ${
                    hoveredRegime === 'high' 
                      ? 'border-rose-400 bg-rose-950/80 scale-110 shadow-lg shadow-rose-500/10' 
                      : 'border-slate-800 bg-slate-900'
                  }`}
                  onMouseEnter={() => setHoveredRegime('high')}
                  onMouseLeave={() => setHoveredRegime(null)}
                >
                  <span className="text-[9px] font-bold text-slate-500 uppercase">S3</span>
                  <span className="text-[10px] font-black text-rose-400">High</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-4 font-mono">
              <span>{modelInfo ? `Log Likelihood: ${Number(modelInfo.log_likelihood).toFixed(2)}` : "Log Likelihood: —"}</span>
              <span>Confidence: {confidencePct}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ================= METHODOLOGY FEATURES ================= */}
      <section className="bg-slate-900/40 border-y border-slate-900 py-24 px-6 md:px-12 xl:px-24">
        <div className="max-w-[1440px] mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">
              Application Features
            </h2>
            <p className="text-3xl md:text-4xl font-extrabold text-white">
              Smarter Time-Series Classification
            </p>
            <p className="text-slate-400 mt-4 leading-relaxed">
              Standard alerts only trigger when a threshold is crossed. AeroMetrics uses Hidden Markov Models to classify the underlying health and regime transitions over time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="group border border-slate-900 bg-slate-950/30 p-8 rounded-2xl hover:border-slate-800 hover:bg-slate-900/30 transition-all">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Upload size={22} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Dataset Ingestion</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Directly upload CSV time-series data. Features include automated previews, columns validation, missing value reconstruction, and size limits enforcement.
              </p>
              <Link to="/upload" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
                Ingest CSV
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="group border border-slate-900 bg-slate-950/30 p-8 rounded-2xl hover:border-slate-800 hover:bg-slate-900/30 transition-all">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <Cpu size={22} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Markov State Optimization</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Configure custom state counts (2 to 5 states). Our HMM optimization runs training to estimate emission distributions and state transition matrices dynamically.
              </p>
              <Link to="/settings" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                Configure Engine
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="group border border-slate-900 bg-slate-950/30 p-8 rounded-2xl hover:border-slate-800 hover:bg-slate-900/30 transition-all">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 size={22} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Interactive Dashboards</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Gain insights via transitional probability matrices, temporal aggregations, and confidence thresholds. Export analytics and track historical run audits.
              </p>
              <Link to="/advanced" className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors">
                Explore Analytics
                <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ================= CAPABILITIES TAG BAR ================= */}
      <section className="border-b border-slate-900 py-10 px-6 md:px-12 xl:px-24">
        <div className="max-w-[1440px] mx-auto flex flex-wrap gap-8 justify-around items-center text-slate-500 text-xs font-bold tracking-widest uppercase">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-blue-500/50" />
            <span>CSV Ingestion Layer</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-indigo-500/50" />
            <span>HMM Engine Classifier</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-purple-500/50" />
            <span>Transitional Probability Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500/50" />
            <span>SQL Database Persistence</span>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="px-6 md:px-12 xl:px-24 py-16 max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 justify-between items-start mb-12">
          
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-black">
                A
              </div>
              <span className="font-bold text-white tracking-tight">AeroMetrics</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
              An advanced environmental time-series regime modeling suite built with Python, FastAPI, and React.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-slate-400 text-sm">
            <span className="hover:text-white transition-colors cursor-pointer">About Product</span>
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Charter</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-white transition-colors cursor-pointer">GitHub Repo</span>
          </div>

          <div className="text-slate-400 text-sm lg:text-right">
            <p className="font-semibold text-slate-200">Developed by AeroMetrics</p>
            <p className="text-xs text-slate-500 mt-1">Platform Version 2.4.0-stable</p>
          </div>

        </div>

        <div className="border-t border-slate-900 pt-8 text-center text-slate-600 text-xs">
          © 2026 AEROMETRICS DETECTION SUITE. ALL RIGHTS RESERVED.
        </div>
      </footer>

    </div>
  );
};

export default Landing;