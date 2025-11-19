import React, { useState } from 'react';
import { Issue } from '../types';
import { MessageSquare, Sparkles, ExternalLink, Terminal, Check, Copy } from 'lucide-react';
import { analyzeIssue } from '../services/geminiService';

interface IssueCardProps {
  issue: Issue;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const [analysis, setAnalysis] = useState<{ summary: string; priority: string; suggestedFix: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (analysis) return; // Already analyzed
    setIsAnalyzing(true);
    const result = await analyzeIssue(issue.title, issue.body);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleCopyGitCommand = () => {
    // Create a kebab-case slug from the title
    const slug = issue.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Determine prefix based on labels or default to 'feature'
    const type = issue.labels.some(l => l.name.includes('bug')) ? 'fix' : 'feature';
    
    const command = `git checkout -b ${type}/${issue.number}-${slug}`;
    
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-warp-panel border border-warp-border rounded-xl p-5 hover:border-warp-accent/50 transition-colors group flex flex-col h-full">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
           <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
             issue.state === 'open' 
              ? 'bg-warp-success/10 text-warp-success border border-warp-success/20' 
              : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
           }`}>
             {issue.state.toUpperCase()}
           </span>
           <span className="text-warp-text text-xs font-mono">#{issue.number}</span>
        </div>
        <span className="text-xs text-warp-text/60">{new Date(issue.created_at).toLocaleDateString()}</span>
      </div>

      <h3 className="text-lg font-semibold text-warp-textBright mb-2 group-hover:text-warp-accent transition-colors">
        {issue.title}
      </h3>
      
      <p className="text-warp-text text-sm line-clamp-2 mb-4 font-mono text-xs opacity-80 flex-1">
        {issue.body}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {issue.labels.map((label) => (
          <span 
            key={label.name}
            className="text-[10px] px-2 py-0.5 rounded-full font-medium border border-white/5"
            style={{ backgroundColor: `#${label.color}20`, color: `#${label.color}` }}
          >
            {label.name}
          </span>
        ))}
      </div>

      {analysis && (
        <div className="mb-4 p-3 bg-warp-bg/50 rounded-lg border border-warp-border/50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-2 text-warp-accent">
            <Sparkles className="w-3 h-3" />
            <span className="text-xs font-bold uppercase tracking-wider">AI Insight</span>
          </div>
          <div className="text-xs text-warp-textBright mb-1"><span className="text-warp-text">Summary:</span> {analysis.summary}</div>
          <div className="text-xs text-warp-textBright mb-1"><span className="text-warp-text">Priority:</span> <span className={analysis.priority === 'High' ? 'text-warp-danger' : 'text-warp-success'}>{analysis.priority}</span></div>
          <div className="text-xs text-warp-textBright"><span className="text-warp-text">Fix:</span> {analysis.suggestedFix}</div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-warp-border/50 mt-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-warp-text text-xs">
            <MessageSquare className="w-3 h-3" />
            <span>{issue.comments}</span>
          </div>
          <img src={issue.user.avatar_url} alt={issue.user.login} className="w-5 h-5 rounded-full ring-1 ring-warp-border" />
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleCopyGitCommand}
            className={`p-2 rounded-lg transition-all border ${
              copied 
                ? 'bg-warp-success/20 text-warp-success border-warp-success/30' 
                : 'bg-warp-bg hover:bg-warp-accent/10 text-warp-text hover:text-warp-accent border-transparent hover:border-warp-accent/30'
            }`}
            title="Copy Git Checkout Command"
          >
            {copied ? <Check className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
          </button>

          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="p-2 rounded-lg bg-warp-bg hover:bg-warp-accent/10 text-warp-text hover:text-warp-accent transition-all border border-transparent hover:border-warp-accent/30"
            title="Analyze with Gemini"
          >
            <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </button>
          
          <a 
            href={issue.html_url} 
            target="_blank" 
            rel="noreferrer"
            className="p-2 rounded-lg bg-warp-bg hover:bg-warp-accent/10 text-warp-text hover:text-warp-accent transition-all border border-transparent hover:border-warp-accent/30"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;