import { NavLink, Outlet } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Brain,
  Droplets,
  History as HistoryIcon,
} from "lucide-react";

function AppLayout() {
  const navigationItems = [
    {
      name: "Operations",
      path: "/operations",
      icon: Activity,
    },
    {
      name: "AI Control",
      path: "/ai-control",
      icon: Brain,
    },
    {
      name: "History",
      path: "/history",
      icon: HistoryIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen gap-3 p-3">
        {/* Sidebar */}
        <aside className="sticky top-3 flex h-[calc(100vh-1.5rem)] w-64 shrink-0 flex-col rounded-2xl border border-slate-800/80 bg-slate-900/90 shadow-xl shadow-black/40 backdrop-blur">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-slate-800/60 px-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10">
              <Droplets className="h-5 w-5 text-cyan-400" />
            </div>

            <div>
              <h1 className="text-sm font-semibold tracking-wide">
                AquaSentinel
              </h1>

              <p className="text-xs text-slate-500">
                Urban Response System
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 p-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-400"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* System Status */}
          <div className="mt-auto border-t border-slate-800/60 p-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-slate-400">
                System Operational
              </span>
            </div>
          </div>
        </aside>

        {/* Main Area */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950">
          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;