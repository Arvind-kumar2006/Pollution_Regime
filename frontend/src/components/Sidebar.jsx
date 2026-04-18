import { Link, useLocation } from "react-router-dom";
import { 
  BarChart2, 
  CloudUpload, 
  History, 
  Database,
  MoreHorizontal,
  Activity,
  Settings as SettingsIcon
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const menu = [
    { name: "Upload Dataset", path: "/upload", icon: CloudUpload },
    { name: "History & Logs", path: "/history", icon: History },
    { name: "Analytics", path: "/dashboard", icon: BarChart2 },
    { name: "Advanced Analytics", path: "/advanced", icon: Activity },
    { name: "Settings", path: "/settings", icon: SettingsIcon },
  ];

  return (
    <aside
      className="flex flex-col bg-[#F8FAFC] border-r border-[#E2E8F0] min-h-screen relative"
      style={{ width: "260px" }}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-8 border-b border-[#E2E8F0]/60">
        <div className="w-8 h-8 flex items-center justify-center text-[#6366F1]">
          <Database size={24} strokeWidth={2.5} />
        </div>
        <span className="text-[20px] font-black text-[#1E293B] tracking-tight">
          DataSynth AI
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-8 space-y-1.5">
        {menu.map((item) => {
          const isActive = location.pathname.includes(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-[#6366F1] text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)]" 
                  : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#334155]"
              }`}
            >
              <item.icon size={20} className={isActive ? "text-white" : "text-[#94A3B8]"} />
              <span className={`text-[14px] ${isActive ? "font-bold" : "font-semibold"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}