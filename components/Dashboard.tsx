import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Issue, ResearchNote } from '../types';
import { CheckCircle2, AlertOctagon, FileText, Zap } from 'lucide-react';

interface DashboardProps {
  issues: Issue[];
  notes: ResearchNote[];
}

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-warp-panel border border-warp-border p-6 rounded-xl relative overflow-hidden group">
    <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
      <Icon className="w-24 h-24" />
    </div>
    <div className="relative z-10">
      <p className="text-warp-text text-sm font-medium uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-warp-textBright font-mono">{value}</h3>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ issues, notes }) => {
  const stats = useMemo(() => {
    const open = issues.filter(i => i.state === 'open').length;
    const closed = issues.filter(i => i.state === 'closed').length;
    const totalNotes = notes.length;
    return { open, closed, totalNotes };
  }, [issues, notes]);

  const chartData = useMemo(() => {
    const labels = new Map<string, number>();
    issues.forEach(i => {
       i.labels.forEach(l => {
         labels.set(l.name, (labels.get(l.name) || 0) + 1);
       });
    });
    return Array.from(labels.entries()).map(([name, value]) => ({ name, value }));
  }, [issues]);

  const COLORS = ['#00bcff', '#00dc82', '#eab308', '#ef4444', '#a855f7'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-warp-textBright mb-2">Mission Control</h2>
        <p className="text-warp-text">Overview of active development streams.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Open Issues" value={stats.open} icon={AlertOctagon} color="text-warp-warning" />
        <StatCard title="Resolved" value={stats.closed} icon={CheckCircle2} color="text-warp-success" />
        <StatCard title="Research Notes" value={stats.totalNotes} icon={FileText} color="text-warp-accent" />
        <StatCard title="Efficiency" value="94%" icon={Zap} color="text-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-warp-panel border border-warp-border p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-warp-textBright mb-6">Issue Distribution by Label</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  tick={{fill: '#a6accd', fontSize: 12}} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f111a', borderColor: '#2e3445', color: '#fff' }}
                  cursor={{fill: 'transparent'}}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-warp-panel border border-warp-border p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-warp-textBright mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {issues.slice(0, 3).map((issue) => (
              <div key={issue.id} className="flex items-center gap-3 p-3 rounded-lg bg-warp-bg/50 border border-warp-border/50">
                 <div className={`w-2 h-2 rounded-full ${issue.state === 'open' ? 'bg-warp-warning' : 'bg-warp-success'}`} />
                 <div className="flex-1 min-w-0">
                   <p className="text-sm text-warp-textBright font-medium truncate">{issue.title}</p>
                   <p className="text-xs text-warp-text truncate">#{issue.number} • {new Date(issue.created_at).toLocaleDateString()}</p>
                 </div>
                 <span className="text-xs font-mono text-warp-accent">{issue.user.login}</span>
              </div>
            ))}
            {issues.length === 0 && <div className="text-warp-text text-sm">No activity detected.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;