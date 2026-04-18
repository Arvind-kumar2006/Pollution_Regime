import { useEffect, useState } from "react";
import { getAdvancedAnalytics } from "../api/api";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Activity, ArrowRight, Download, Award, Info, AlertTriangle } from "lucide-react";

export default function Advanced() {
  const [data, setData] = useState({ transitions: [], hourly: [], confidence: [], insights: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [daysFilter, setDaysFilter] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [daysFilter]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getAdvancedAnalytics(daysFilter);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load advanced analytics.");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const getTransitionColor = (_source, target) => {
    const t = String(target || "").toLowerCase();
    if (t === "high") return "bg-rose-500";
    if (t === "volatile") return "bg-amber-500";
    return "bg-indigo-500";
  };

  const maxTransitionRaw = data.transitions.length > 0 ? Math.max(...data.transitions.map(t => t.count)) : 1;
  const maxTransition = maxTransitionRaw > 0 ? maxTransitionRaw : 1;

  const confScores = (data.confidence || []).map((c) => c.score).filter((n) => Number.isFinite(n));
  const confMin = confScores.length ? Math.min(...confScores) : 0;
  const confMax = confScores.length ? Math.max(...confScores) : 100;
  const confPad = Math.max(2, (confMax - confMin) * 0.08);
  const yDomain = [Math.max(0, confMin - confPad), Math.min(100, confMax + confPad)];

  if (loading) {
     return (
        <div className="p-10 bg-[#FBFCFF] min-h-[calc(100vh-73px)] flex items-center justify-center">
            <div className="flex flex-col items-center">
               <Activity className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
               <p className="font-bold text-slate-500">Compiling Advanced Analytics from Regime Predictions...</p>
            </div>
        </div>
     );
  }

  if (error) {
     return (
        <div className="p-10 bg-[#FBFCFF] min-h-[calc(100vh-73px)] text-slate-800">
           <div className="bg-rose-50 p-6 rounded-xl border border-rose-100 text-rose-700 font-bold">
              {error}
           </div>
        </div>
     );
  }

  return (
    <div className="p-12 bg-[#FBFCFF] min-h-[calc(100vh-73px)] text-slate-800 font-sans max-w-[1500px] mx-auto pb-24 border-l border-slate-100 shadow-[0_0_40px_rgba(0,0,0,0.01)]">
      
      <div className="mb-10 flex justify-between items-end">
         <div>
            <h1 className="text-[32px] font-black text-slate-900 tracking-tight mb-2">
               Advanced Analytics
            </h1>
            <p className="text-[15px] font-medium text-slate-500 max-w-[700px] leading-relaxed">
               Deep-dive metrics evaluating HMM regime state hopping probabilities, cyclic daily pollution accumulation patterns, and continuous posterior model confidence.
            </p>
            {data.run_id && (
               <p className="text-[12px] font-mono text-slate-400 mt-2">
                  Same run as Dashboard: <span className="text-slate-600">{String(data.run_id).slice(0, 8)}…</span>
               </p>
            )}
            {data.window_note && (
               <p className="text-[13px] font-medium text-slate-600 mt-2 max-w-[700px]">{data.window_note}</p>
            )}
         </div>
         
         <div className="flex flex-col items-end gap-4">
            <button 
               onClick={() => {
                  const csvContent = "data:text/csv;charset=utf-8," + 
                     "Source,Target,Count,Percentage\n" + 
                     data.transitions.map(t => `${t.source},${t.target},${t.count},${t.percentage}%`).join("\n");
                  const link = document.createElement("a");
                  link.setAttribute("href", encodeURI(csvContent));
                  link.setAttribute("download", `hmm_transitions_export.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
               }}
               className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors"
            >
               <Download size={16} /> Export CSV
            </button>
            
            <div className="flex bg-slate-100 p-1 rounded-xl shadow-sm border border-slate-200">
               {[
                  { label: 'All', val: null },
                  { label: '24h', val: 1 },
                  { label: '7 Days', val: 7 },
                  { label: '30 Days', val: 30 },
               ].map(f => (
                  <button 
                     key={f.label}
                     onClick={() => setDaysFilter(f.val)}
                     className={`px-4 py-1.5 text-[12px] font-bold rounded-lg transition-all ${daysFilter === f.val ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                     {f.label}
                  </button>
               ))}
            </div>
         </div>
      </div>

      <div className="flex gap-8 mb-8 h-[460px]">
         
         {/* Transition Matrix Card */}
         <div className="w-[420px] bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col shrink-0">
            <div className="mb-8">
               <h3 className="text-[18px] font-black text-slate-900 mb-1 tracking-tight">Transition Matrix</h3>
               <p className="text-[13px] font-medium text-slate-500">
                  Regime-to-regime counts for the time window (see note under the page title).
               </p>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
               {data.transitions.length === 0 ? (
                  <p className="text-sm font-bold text-slate-400 text-center mt-10">No transitions recorded</p>
               ) : (
                  data.transitions.map((t, i) => (
                     <div key={i} className={`flex items-center group ${i === 0 ? 'bg-slate-50 p-3 rounded-xl border border-slate-100 -mx-3' : ''}`}>
                        <div className="w-[140px] flex items-center gap-2 text-[13px] font-bold text-slate-700 shrink-0">
                           {i === 0 && <Award size={14} className="text-amber-500 shrink-0" />}
                           <span>{t.source}</span>
                           <ArrowRight size={12} className="text-slate-300 stroke-[3px] group-hover:text-slate-500 transition-colors"/>
                           <span>{t.target}</span>
                        </div>
                        <div className="flex-1 px-4 relative flex items-center">
                           <div className="w-full h-1.5 bg-slate-100 rounded-full"></div>
                           <div 
                              className={`absolute h-1.5 rounded-full ${getTransitionColor(t.source, t.target)} left-4 transition-all duration-1000`} 
                              style={{ width: `calc(${(t.count / maxTransition) * 100}% - 32px)` }}
                           ></div>
                        </div>
                        <div className="w-[80px] text-right shrink-0">
                           <div className="text-[15px] font-black text-slate-800">{t.count}</div>
                           <div className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">{t.percentage}%</div>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>

         {/* Confidence Trend Chart */}
         <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col">
            <div className="mb-6">
               <h3 className="text-[18px] font-black text-slate-900 mb-1 tracking-tight">Confidence Trend</h3>
               <p className="text-[13px] font-medium text-slate-500">Model posterior confidence over 48 hours</p>
            </div>
            <div className="flex-1 min-h-0 relative -ml-4">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.confidence} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                       dataKey="time" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                       dy={10}
                       interval={3}
                    />
                    <YAxis 
                       domain={yDomain}
                       axisLine={false} 
                       tickLine={false} 
                       tickFormatter={(v) => Math.round(v) + "%"}
                       tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                       dx={-5}
                    />
                    <Tooltip 
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                       labelStyle={{ fontWeight: 'bold', color: '#64748b' }}
                       formatter={(val) => [`${val}%`, 'Certainty / Confidence']}
                    />
                    <Line 
                       type="monotone" 
                       dataKey="score" 
                       stroke="#0EA5E9" 
                       strokeWidth={2.5} 
                       dot={false}
                       activeDot={{ r: 6, fill: "#0EA5E9", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>

      </div>

      {/* Hourly Pollution Pattern */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm h-[400px] flex flex-col">
         <div className="mb-6 flex justify-between items-end">
            <div>
               <h3 className="text-[18px] font-black text-slate-900 mb-1 tracking-tight">Hourly Pollution Pattern</h3>
               <p className="text-[13px] font-medium text-slate-500">Average AQI by hour of day (00—23)</p>
            </div>
            
            {data.insights?.highest_hour && (
               <div className="flex gap-4">
                  <div className="bg-rose-50 border border-rose-100 px-4 py-2 rounded-xl flex items-center gap-2">
                     <AlertTriangle size={14} className="text-rose-500" />
                     <span className="text-[12px] font-black text-rose-700 uppercase tracking-widest">
                        Highest: {data.insights.highest_hour}
                     </span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl flex items-center gap-2">
                     <Info size={14} className="text-emerald-500" />
                     <span className="text-[12px] font-black text-emerald-700 uppercase tracking-widest">
                        Lowest: {data.insights.lowest_hour}
                     </span>
                  </div>
               </div>
            )}
         </div>
         <div className="flex-1 min-h-0 relative -ml-4">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data.hourly} margin={{ top: 20, right: 30, left: 10, bottom: 5 }} barSize={34}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis 
                    dataKey="time_label" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    dy={10}
                 />
                 <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                    dx={-5}
                 />
                 <Tooltip
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#64748b' }}
                    formatter={(val) => [`${val} AQI`, 'Average']}
                 />
                 <Bar dataKey="avg_aqi" fill="#8B5CF6" radius={[6, 6, 6, 6]} />
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

    </div>
  );
}
