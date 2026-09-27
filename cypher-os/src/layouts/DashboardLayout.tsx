import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, BookOpen, Shield, Settings, Bell, LogOut } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();

  const sidebarItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Academy', path: '/academy', icon: BookOpen },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-black text-white">
      <aside className="w-64 border-r border-white/10 hidden lg:flex flex-col justify-between p-4 bg-[#0F0D0F]">
        <div>
          <Link to="/" className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-white/10">
            <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Shield className="size-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-medium text-white block">CIPHER OS</span>
              <span className="text-[10px] text-neutral-500">Command node</span>
            </div>
          </Link>

          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? 'text-white bg-white/10'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-white">
              OP
            </div>
            <div className="text-[10px]">
              <div className="text-neutral-100">Operator_01</div>
              <div className="text-emerald-400">Node active</div>
            </div>
          </div>
          <Link to="/" className="text-neutral-500 hover:text-red-400 transition-colors">
            <LogOut className="size-4" />
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-white/10 px-6 py-3 flex items-center justify-between bg-[#0F0D0F]">
          <div className="text-xs text-neutral-500 uppercase tracking-widest flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Command hub</span>
          </div>
          <button className="text-neutral-500 hover:text-white transition-colors relative">
            <Bell className="size-4" />
            <span className="absolute -top-1 -right-1 size-2 rounded-full bg-blue-500" />
          </button>
        </header>
        <main className="p-6 md:p-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
