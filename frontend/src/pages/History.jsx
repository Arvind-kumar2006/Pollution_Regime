import { useEffect, useState, useRef } from "react";
import { getHistory, deleteHistoryRun } from "../api/api";
import { Search, RefreshCw, Download, Hash, Gauge, CheckCircle2, Activity, ChevronDown, Check, Eye, Trash2, RotateCcw, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function History() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalMetrics, setGlobalMetrics] = useState({
    successRate: 0,
    totalTransitions: 0,
    globalAvgAqi: null,
    avgAqiDelta: null,
  });

  // Toolbar States
  const [searchTerm, setSearchTerm] = useState("");
  
  const [regimeFilter, setRegimeFilter] = useState("All regime");
  const [regimeMenuOpen, setRegimeMenuOpen] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState("All status");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  
  const regimeRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  // Close filter dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (regimeRef.current && !regimeRef.current.contains(event.target)) setRegimeMenuOpen(false);
      if (statusRef.current && !statusRef.current.contains(event.target)) setStatusMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [deleting, setDeleting] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const historyRes = await getHistory();
      const raw = historyRes.data?.data || historyRes.data || [];
      
      const enrichedData = raw.map(item => {
         return {
            id: item.run_id,
            filename: item.dataset_file_name || "—",
            executed: item.created_at ? new Date(item.created_at) : new Date(),
            duration: `${item.duration_seconds}s`,
            avgAqi: item.avg_aqi,
            peakAqi: item.peak_aqi,
            confidence: item.confidence !== null ? `${item.confidence.toFixed(1)}%` : "Pending", // True dynamic logic powered by backend AQI distribution
            finalRegime: item.final_regime,
            status: item.status
         };
      });

      setRuns(enrichedData);
      setGlobalMetrics({
        successRate: historyRes.data?.global_success_rate ?? 0,
        totalTransitions: historyRes.data?.global_total_transitions ?? 0,
        globalAvgAqi: historyRes.data?.global_avg_aqi ?? null,
        avgAqiDelta: historyRes.data?.avg_aqi_delta_vs_prior_mean_pct ?? null,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const executeDelete = async (id, e) => {
     e.stopPropagation();
     setDeleting(true);
     try {
       await deleteHistoryRun(id);
       await fetchHistory();
     } catch(err) {
       console.error("Deletion failed", err);
     } finally {
       setDeleting(false);
     }
  };

  const getRegimeColor = (regime) => {
     if(regime.toLowerCase() === 'high') return "text-rose-600 bg-rose-50 border-rose-200 fill-rose-500 stroke-rose-500";
     if(regime.toLowerCase() === 'volatile') return "text-amber-600 bg-amber-50 border-amber-200 fill-amber-500 stroke-amber-500";
     return "text-emerald-600 bg-emerald-50 border-emerald-200 fill-emerald-500 stroke-emerald-500";
  };

  const getStatusColor = (status) => {
     if(status.toLowerCase() === 'success') return "text-emerald-700 bg-emerald-50 border-emerald-200 fill-emerald-500 stroke-emerald-500";
     if(status.toLowerCase() === 'failed') return "text-rose-700 bg-rose-50 border-rose-200 fill-rose-500 stroke-rose-500";
     return "text-blue-700 bg-blue-50 border-blue-200 fill-blue-500 stroke-blue-500"; // running
  };

  const totalRuns = runs.length;
  const systemAvgAqi =
    globalMetrics.globalAvgAqi != null
      ? Math.round(globalMetrics.globalAvgAqi)
      : totalRuns > 0
        ? Math.round(runs.reduce((acc, curr) => acc + curr.avgAqi, 0) / totalRuns)
        : 0;
  
  const handleExportCSV = () => {
     if (runs.length === 0) return;
     const headers = ["Filename", "Executed", "Duration", "Avg AQI", "Peak AQI", "Final Regime", "Confidence", "Status"];
     const rows = runs.map((r) => {
        const dateStr = r.executed.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
        return `${r.filename},${dateStr},${r.duration},${r.avgAqi},${r.peakAqi},${r.finalRegime},${r.confidence},${r.status}`;
     });

     const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
     const encodedUri = encodeURI(csvContent);
     const link = document.createElement("a");
     link.setAttribute("href", encodedUri);
     link.setAttribute("download", `analysis_history_${new Date().getTime()}.csv`);
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };

  const filteredRuns = runs.filter((r) => {
      const matchesSearch = r.filename.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegime = regimeFilter === "All regime" || r.finalRegime.toLowerCase() === regimeFilter.toLowerCase();
      const matchesStatus = statusFilter === "All status" || r.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesRegime && matchesStatus;
  });

  return (
    <div className="p-10 bg-[#FBFCFF] min-h-[calc(100vh-73px)] text-slate-800 font-sans max-w-[1500px] mx-auto relative border-l border-slate-100 shadow-[0_0_40px_rgba(0,0,0,0.01)] mb-20">
      
      {/* Header aligned perfectly with the design */}
      <div className="flex justify-between items-start mb-8 mt-2">
         <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-[#6366F1] flex items-center gap-2 mb-2">
               AUDIT TRAIL
            </p>
            <h1 className="text-[32px] font-black text-slate-900 tracking-tight mb-2">
               Analysis Execution History
            </h1>
            <p className="text-[14px] font-medium text-slate-500 max-w-[650px] leading-relaxed">
               Every model run, validation pass, and regime classification is logged here for auditability and reproducibility.
            </p>
         </div>
         
         <div className="flex items-center gap-3">
            <button 
               onClick={fetchHistory}
               className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-[14px] font-bold transition-all shadow-sm"
            >
               <RefreshCw size={16} strokeWidth={2.5} className={loading ? "animate-spin" : ""}/> Refresh
            </button>
            <button 
               onClick={handleExportCSV}
               className="flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] hover:bg-indigo-600 text-white rounded-xl text-[14px] font-bold transition-all shadow-md shadow-indigo-200"
            >
               <Download size={16} strokeWidth={2.5}/> Export CSV
            </button>
         </div>
      </div>

      {/* Top 4 KPI Cards aligned with the design */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        
        <div className="border border-slate-200 rounded-[20px] p-6 bg-white shadow-sm flex flex-col justify-between h-[130px]">
           <div className="flex justify-between items-start">
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Total Runs</p>
              <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#6366F1]">
                 <Hash size={16} strokeWidth={2.5}/>
              </div>
           </div>
           <div>
              <h2 className="text-[34px] font-black text-slate-900 leading-none">{totalRuns}</h2>
              <p className="text-[12px] font-bold text-slate-400 mt-1">all runs</p>
           </div>
        </div>

        <div className="border border-slate-200 rounded-[20px] p-6 bg-white shadow-sm flex flex-col justify-between h-[130px]">
           <div className="flex justify-between items-start">
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Average AQI</p>
              <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#6366F1]">
                 <Gauge size={16} strokeWidth={2.5}/>
              </div>
           </div>
           <div>
              <h2 className="text-[34px] font-black text-slate-900 leading-none">{systemAvgAqi}</h2>
              {globalMetrics.avgAqiDelta != null ? (
                <p
                  className={`text-[12px] font-black mt-1 ${
                    globalMetrics.avgAqiDelta >= 0 ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {globalMetrics.avgAqiDelta >= 0 ? "+" : ""}
                  {globalMetrics.avgAqiDelta}% vs prior runs mean
                </p>
              ) : (
                <p className="text-[12px] font-bold text-slate-400 mt-1">—</p>
              )}
           </div>
        </div>

        <div className="border border-slate-200 rounded-[20px] p-6 bg-white shadow-sm flex flex-col justify-between h-[130px]">
           <div className="flex justify-between items-start">
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Success Rate</p>
              <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#6366F1]">
                 <CheckCircle2 size={16} strokeWidth={2.5}/>
              </div>
           </div>
           <div>
              <h2 className="text-[34px] font-black text-slate-900 leading-none">{globalMetrics.successRate}%</h2>
              <p className="text-[12px] font-black text-emerald-500 mt-1">native validation</p>
           </div>
        </div>

        <div className="border border-slate-200 rounded-[20px] p-6 bg-white shadow-sm flex flex-col justify-between h-[130px]">
           <div className="flex justify-between items-start">
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Total Transitions</p>
              <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#6366F1]">
                 <Activity size={16} strokeWidth={2.5}/>
              </div>
           </div>
           <div>
              <h2 className="text-[34px] font-black text-slate-900 leading-none">{globalMetrics.totalTransitions}</h2>
              <p className="text-[12px] font-bold text-slate-400 mt-1">across all runs</p>
           </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="border border-slate-200 rounded-[24px] bg-white shadow-sm p-3 mb-8">
         
         {/* Filter toolbar */}
         <div className="flex justify-between items-center gap-4 mb-4 mt-1 px-3">
            <div className="relative flex-1">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={2.5}/>
               <input 
                 type="text" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Search filename..." 
                 className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
               />
            </div>
            
            <div className="flex items-center gap-3">
               
               {/* Regime Dropdown */}
               <div className="relative" ref={regimeRef}>
                 <button 
                   onClick={() => setRegimeMenuOpen(!regimeMenuOpen)}
                   className="flex justify-between items-center w-[160px] px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                 >
                    {regimeFilter} <ChevronDown size={14} className="text-slate-400 stroke-[3px]"/>
                 </button>
                 {regimeMenuOpen && (
                    <div className="absolute top-[52px] right-0 w-[160px] bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-20">
                       {['All regime', 'Stable', 'Volatile', 'High'].map(opt => (
                          <button key={opt} onClick={() => { setRegimeFilter(opt); setRegimeMenuOpen(false); }} className="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-[13px] font-bold text-slate-700 hover:bg-slate-50">
                             {opt} {regimeFilter === opt && <Check size={14} className="text-indigo-600"/>}
                          </button>
                       ))}
                    </div>
                 )}
               </div>

               {/* Status Dropdown */}
               <div className="relative" ref={statusRef}>
                 <button 
                   onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                   className="flex justify-between items-center w-[160px] px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                 >
                    {statusFilter} <ChevronDown size={14} className="text-slate-400 stroke-[3px]"/>
                 </button>
                 {statusMenuOpen && (
                    <div className="absolute top-[52px] right-0 w-[160px] bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-20">
                       {['All status', 'Success', 'Failed', 'Running'].map(opt => (
                          <button key={opt} onClick={() => { setStatusFilter(opt); setStatusMenuOpen(false); }} className="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-[13px] font-bold text-slate-700 hover:bg-slate-50">
                             {opt} {statusFilter === opt && <Check size={14} className="text-indigo-600"/>}
                          </button>
                       ))}
                    </div>
                 )}
               </div>

               {/* Placeholder Datepicker */}
               <button className="flex justify-between items-center w-[160px] px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-400 hover:bg-slate-50 transition-colors">
                  dd/mm/yyyy <Calendar size={14} className="text-slate-500 stroke-[2px]"/>
               </button>

            </div>
         </div>

         {/* Run history table */}
         <div className="overflow-hidden px-1">
            <table className="w-full text-left">
               <thead>
                  <tr>
                     <th className="py-4 px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-100">Filename</th>
                     <th className="py-4 px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-100">Executed</th>
                     <th className="py-4 px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-100">Duration</th>
                     <th className="py-4 px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-100 text-center">Avg AQI</th>
                     <th className="py-4 px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-100 text-center">Peak AQI</th>
                     <th className="py-4 px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-100">Dominant Regime</th>
                     <th className="py-4 px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-100 text-right">Confidence</th>
                     <th className="py-4 px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-100 text-right">Status</th>
                     <th className="py-4 px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-100 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="bg-white">
                  {loading ? (
                     [1,2,3,4,5].map(i => (
                        <tr key={i} className="border-b border-slate-100 animate-pulse">
                           <td className="py-5 px-5"><div className="h-5 bg-slate-100 rounded w-32"></div></td>
                           <td className="py-5 px-5"><div className="h-4 bg-slate-100 rounded w-28"></div></td>
                           <td className="py-5 px-5"><div className="h-4 bg-slate-100 rounded w-8"></div></td>
                           <td className="py-5 px-5"><div className="h-5 bg-slate-100 rounded w-8 mx-auto"></div></td>
                           <td className="py-5 px-5"><div className="h-5 bg-slate-100 rounded w-8 mx-auto"></div></td>
                           <td className="py-5 px-5"><div className="h-6 bg-slate-100 rounded-full w-20"></div></td>
                           <td className="py-5 px-5"><div className="h-4 bg-slate-100 rounded w-12 ml-auto"></div></td>
                           <td className="py-5 px-5"><div className="h-6 bg-slate-100 rounded-full w-20 ml-auto"></div></td>
                           <td className="py-5 px-5"><div className="h-4 bg-slate-100 rounded w-16 ml-auto"></div></td>
                        </tr>
                     ))
                  ) : filteredRuns.length === 0 ? (
                     <tr>
                        <td colSpan="9" className="py-12 px-6 text-center text-slate-500 font-medium">No results found mapping those filters.</td>
                     </tr>
                  ) : (
                     filteredRuns.map((r, i) => {
                        const dateStr = r.executed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                        const timeStr = r.executed.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                        
                        return (
                           <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0 group cursor-pointer" onClick={() => navigate(`/history/${r.id}`)}>
                              <td className="py-5 px-5 font-black text-[14px] text-slate-700">{r.filename}</td>
                              <td className="py-5 px-5 flex flex-col justify-center leading-[1.35]">
                                 <span className="text-[13px] font-bold text-slate-700">{dateStr}</span>
                                 <span className="text-[11px] font-bold text-slate-400">{timeStr}</span>
                              </td>
                              <td className="py-5 px-5 text-[14px] font-bold text-slate-500">{r.duration}</td>
                              <td className="py-5 px-5 text-[15px] font-black text-slate-700 text-center">{r.avgAqi}</td>
                              <td className="py-5 px-5 text-[15px] font-black text-slate-700 text-center">{r.peakAqi}</td>
                              <td className="py-5 px-5">
                                 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border tracking-wide ${getRegimeColor(r.finalRegime)}`}>
                                    <svg className="w-2 h-2 rounded-full mt-px" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="5"/></svg>
                                    {r.finalRegime}
                                 </span>
                              </td>
                              <td className="py-5 px-5 text-[14px] font-black text-slate-700 text-right">{r.confidence}</td>
                              <td className="py-5 px-5 text-right">
                                 <span className={`inline-flex items-center justify-end gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border tracking-wide ml-auto ${getStatusColor(r.status)}`}>
                                    <svg className="w-2 h-2 rounded-full mt-px" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="5"/></svg>
                                    {r.status.toLowerCase()}
                                 </span>
                              </td>
                               <td className="py-5 px-5 text-right bg-white">
                                 <div className="flex items-center justify-end gap-2 text-slate-400">
                                    <button onClick={(e) => { e.stopPropagation(); navigate(`/history/${r.id}`); }} className="p-1.5 hover:bg-slate-100 hover:text-indigo-600 rounded-md transition-colors"><Eye size={16} strokeWidth={2.5}/></button>
                                    <button onClick={(e) => { e.stopPropagation(); navigate('/upload'); }} className="p-1.5 hover:bg-slate-100 hover:text-slate-700 rounded-md transition-colors"><RotateCcw size={16} strokeWidth={2.5}/></button>
                                    <button disabled={deleting} onClick={(e) => executeDelete(r.id, e)} className="p-1.5 hover:bg-slate-100 hover:text-rose-600 rounded-md transition-colors disabled:opacity-50"><Trash2 size={16} strokeWidth={2.5}/></button>
                                 </div>
                              </td>
                           </tr>
                        )
                     })
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}