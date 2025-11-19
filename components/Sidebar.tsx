import React from 'react';
import { LayoutDashboard, ListTodo, FlaskConical, Settings, Terminal } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { id: View.DASHBOARD, icon: LayoutDashboard, label: 'Mission Control' },
    { id: View.ISSUES, icon: ListTodo, label: 'Issue Tracker' },
    { id: View.RESEARCH, icon: FlaskConical, label: 'Research Lab' },
    { id: View.SETTINGS, icon: Settings, label: 'Configuration' },
  ];

  return (
    <aside className="w-64 h-screen bg-warp-bg border-r border-warp-border flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-warp-border">
        <div className="p-2 bg-warp-accent/10 rounded-lg">
          <Terminal className="w-6 h-6 text-warp-accent" />
        </div>
        <h1 className="text-xl font-bold font-mono tracking-tighter text-warp-textBright">
          DevNexus
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-warp-panel text-warp-accent shadow-[0_0_15px_rgba(0,188,255,0.1)] border border-warp-border' 
                  : 'text-warp-text hover:bg-warp-panel/50 hover:text-warp-textBright'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-warp-accent' : 'text-warp-text group-hover:text-warp-textBright'}`} />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-warp-accent shadow-[0_0_8px_rgba(0,188,255,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-warp-border">
        <div className="px-4 py-3 rounded-lg bg-gradient-to-br from-warp-panel to-warp-bg border border-warp-border">
          <div className="text-xs text-warp-text mb-1">Status</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-warp-success animate-pulse"></div>
            <span className="text-sm font-mono text-warp-success">System Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;