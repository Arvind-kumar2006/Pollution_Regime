import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardLatest, getModelInfo } from "../api/api";

const Landing = () => {
  const [modelInfo, setModelInfo] = useState(null);
  const [latestPrediction, setLatestPrediction] = useState(null);

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

  return (
    <div className="bg-[#F6F8FC] text-[#0F172A] min-h-screen font-sans">

      {/* ================= NAVBAR ================= */}
      <div className="w-full border-b border-[#E2E8F0] bg-white px-[80px] py-[18px] flex justify-between items-center">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-600 rounded-md"></div>
          <span className="text-[18px] font-semibold text-blue-500">
            Pollution Regime
          </span>
        </div>

        {/* Center Links */}
        <div className="flex gap-10 text-[14px] text-slate-500">
          <span className="hover:text-slate-900 cursor-pointer">Docs</span>
          <span className="hover:text-slate-900 cursor-pointer">Methodology</span>
          <span className="hover:text-slate-900 cursor-pointer">Contact</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6">
          <span className="text-slate-500 text-[14px]">API Reference</span>
          <Link
            to="/dashboard"
            className="bg-white border border-slate-200 shadow-sm px-5 py-2 rounded-md text-sm text-slate-900 hover:shadow-md"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* ================= HERO ================= */}
      <div className="px-[80px] pt-[80px] pb-[120px] flex justify-between items-center">

        {/* LEFT */}
        <div className="max-w-[650px]">

          <div className="inline-block border border-blue-200 bg-white text-blue-600 text-xs px-4 py-1 rounded-full mb-6">
            ⚡ Powered by HMM Technology
          </div>

          <h1 className="text-[72px] leading-[78px] font-bold mb-6">
            Pollution <br />
            Regime <br />
            Detection using{" "}
            <span className="text-blue-500">AI</span>
          </h1>

          <p className="text-slate-500 text-[16px] leading-7 mb-8">
            Analyze time-series air pollution data using Hidden Markov Models
            to detect stable and volatile regimes. Turn raw CSV sensor exports
            into actionable environmental insights.
          </p>

          <div className="flex gap-4 mb-6">
            <Link
              to="/upload"
              className="bg-white border border-slate-200 shadow-sm px-6 py-3 rounded-lg text-sm text-slate-900 hover:shadow-md"
            >
              Get Started
            </Link>

            <Link
              to="/dashboard"
              className="border border-slate-200 bg-white px-6 py-3 rounded-lg text-sm hover:border-blue-300"
            >
              View Dashboard
            </Link>
          </div>

          <p className="text-slate-500 text-sm">
            ⚠ No sensors or external APIs required — upload your CSV to begin.
          </p>
        </div>

        {/* RIGHT CARD */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 w-[420px] shadow-xl">

          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-semibold">
                HMM-based Regime Detection
              </h3>
              <p className="text-xs text-slate-500">
                Sample PM2.5 time-series analysis
              </p>
            </div>

            <div className="flex gap-3 text-xs">
              <span className="text-blue-400">● Stable</span>
              <span className="text-red-400">● Volatile</span>
            </div>
          </div>

          <div className="h-[200px] bg-[#F8FAFC] rounded-lg flex flex-col items-center justify-center text-slate-700 text-sm p-6 text-center">
            {modelInfo ? (
              <>
                <div className="text-[11px] font-bold uppercase text-slate-500 mb-2">Latest Trained Model</div>
                <div className="text-[18px] font-extrabold text-slate-900 mb-2">
                  HMM ({modelInfo.n_states} States)
                </div>
                <div className="text-slate-600">
                  {latestPrediction ? (
                    <>
                      Latest Regime:{" "}
                      <span className="font-bold capitalize">
                        {normalizeRegime(latestPrediction?.regime || latestPrediction?.state)}
                      </span>
                    </>
                  ) : (
                    "Run predictions to see the latest regime"
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="text-[11px] font-bold uppercase text-slate-500 mb-2">No Trained Model</div>
                <div className="text-[16px] font-extrabold text-slate-900 mb-2">Upload & Train to begin</div>
                <div className="text-slate-600">Your chart and regimes will appear here automatically.</div>
              </>
            )}
          </div>

          <div className="flex justify-between text-xs text-slate-500 mt-4">
            <span>{modelInfo ? `Log Likelihood: ${Number(modelInfo.log_likelihood).toFixed(2)}` : "Log Likelihood: —"}</span>
            <span>Confidence: —</span>
          </div>
        </div>
      </div>

      {/* ================= FEATURES ================= */}
      <div className="bg-white px-[80px] py-[80px] border-y border-slate-200">

        <div className="grid grid-cols-3 gap-10">

          {/* CARD 1 */}
          <div>
            <div className="w-12 h-12 bg-blue-600/20 flex items-center justify-center rounded-lg mb-4">
              ⬆
            </div>
            <h3 className="text-lg font-semibold mb-3">Upload Dataset</h3>
            <p className="text-slate-500 text-sm mb-3 leading-6">
              Securely upload your CSV formatted pollution data. Supports PM2.5,
              PM10, NO2, and SO2 time-series without needing active sensor
              connections.
            </p>
            <span className="text-blue-400 text-sm cursor-pointer">
              Upload CSV →
            </span>
          </div>

          {/* CARD 2 */}
          <div>
            <div className="w-12 h-12 bg-blue-600/20 flex items-center justify-center rounded-lg mb-4">
              ⚙
            </div>
            <h3 className="text-lg font-semibold mb-3">Train Model</h3>
            <p className="text-slate-500 text-sm mb-3 leading-6">
              Configure your Hidden Markov Model with custom states. Our engine
              automatically optimizes transition probabilities for your dataset.
            </p>
            <span className="text-blue-400 text-sm cursor-pointer">
              Configure & Train →
            </span>
          </div>

          {/* CARD 3 */}
          <div>
            <div className="w-12 h-12 bg-blue-600/20 flex items-center justify-center rounded-lg mb-4">
              📊
            </div>
            <h3 className="text-lg font-semibold mb-3">
              Visualize Predictions
            </h3>
            <p className="text-slate-500 text-sm mb-3 leading-6">
              Instantly view regime transitions. Identify persistent 'Stable'
              periods and risky 'Volatile' bursts with high-confidence mapping.
            </p>
            <span className="text-blue-400 text-sm cursor-pointer">
              Explore Visuals →
            </span>
          </div>
        </div>
      </div>

      {/* ================= TAG BAR ================= */}
      <div className="border-t border-[#E2E8F0] border-b border-[#E2E8F0] py-6 px-[80px] flex justify-between text-slate-500 text-sm">
        <span>📁 CSV_INPUT</span>
        <span>🧠 HMM_INFERENCE</span>
        <span>⬇ EXPORTABLE_REPORTS</span>
        <span>🔒 DATA_INTEGRITY</span>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="px-[80px] py-[60px]">

        <div className="flex justify-between items-start mb-10">

          <div>
            <h2 className="text-blue-500 font-semibold mb-2">
              Pollution Regime
            </h2>
            <p className="text-slate-500 text-sm">
              Built for professional environmental data analysis.
            </p>
          </div>

          <div className="flex gap-8 text-slate-500 text-sm">
            <span>About</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Source Code</span>
          </div>

          <div className="text-right text-slate-500 text-sm">
            <p>Developed by AeroMetrics</p>
            <p className="text-xs">Version 2.4.0-stable</p>
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] pt-6 text-center text-slate-500 text-xs">
          © 2026 POLLUTION REGIME DETECTION TOOL. ALL RIGHTS RESERVED.
        </div>
      </div>
    </div>
  );
};

export default Landing;