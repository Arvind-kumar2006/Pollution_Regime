import { useEffect, useState } from "react";
import { fetchHealth } from "../api/api";

export default function Navbar() {
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;
    const ping = async () => {
      try {
        const res = await fetchHealth();
        if (!cancelled) setApiStatus(res?.data?.status === "ok" ? "ok" : "degraded");
      } catch {
        if (!cancelled) setApiStatus("offline");
      }
    };
    ping();
    const id = setInterval(ping, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const statusLabel =
    apiStatus === "ok"
      ? "API ONLINE"
      : apiStatus === "checking"
        ? "CHECKING…"
        : apiStatus === "degraded"
          ? "API DEGRADED"
          : "API OFFLINE";

  const dotClass =
    apiStatus === "ok"
      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
      : apiStatus === "checking"
        ? "bg-amber-400 animate-pulse"
        : apiStatus === "degraded"
          ? "bg-amber-500"
          : "bg-rose-500";

  return (
    <header className="h-[72px] border-b border-slate-200 bg-white flex items-center justify-between px-8 z-10 relative">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-semibold text-sm">Project:</span>
          <span className="text-slate-800 font-bold text-sm tracking-tight px-3 py-1 bg-slate-100 rounded-lg">
            Pollution Regime
          </span>
        </div>

        <div className="h-5 w-px bg-slate-200"></div>

        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${dotClass}`} />
          <span className="text-[11px] font-bold text-slate-500 tracking-wider">{statusLabel}</span>
        </div>
      </div>

      <div></div>
    </header>
  );
}
