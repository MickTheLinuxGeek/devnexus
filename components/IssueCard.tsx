import React, { useState } from 'react';
import { Issue } from '../types';
import { MessageSquare, Sparkles, ExternalLink, Terminal, Check, FileText, X } from 'lucide-react';
import { analyzeIssue, draftPullRequest } from '../services/geminiService';

interface IssueCardProps {
  issue: Issue;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const [analysis, setAnalysis] = useState<{ summary: string; priority: string; suggestedFix: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [prDraft, setPrDraft] = useState<{ title: string; description: string } | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [showPrModal, setShowPrModal] = useState(false);

  const handleAnalyze = async () => {
    if (analysis) return; // Already analyzed
    setIsAnalyzing(true);
    const result = await analyzeIssue(issue.title, issue.body);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleDraftPR = async () => {
    setIsDrafting(true);
    const result = await draftPullRequest(issue.title, issue.body, analysis?.suggestedFix);
    setPrDraft(result);
    setIsDrafting(false);
    setShowPrModal(true);
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

  const updatePrDraft = (key: 'title' | 'description', value: string) => {
    if (prDraft) {
      setPrDraft({ ...prDraft, [key]: value });
    }
  };


  return (
    <>
      <div className="bg-warp-panel border border-warp-border rounded-xl p-5 hover:border-warp-accent/50 transition-colors group flex flex-col h-full relative">
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
              onClick={handleDraftPR}
              disabled={isDrafting}
              className="p-2 rounded-lg bg-warp-bg hover:bg-warp-accent/10 text-warp-text hover:text-warp-accent transition-all border border-transparent hover:border-warp-accent/30"
              title="Draft PR Description"
            >
              <FileText className={`w-4 h-4 ${isDrafting ? 'animate-pulse' : ''}`} />
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

      {showPrModal && prDraft && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-warp-panel border border-warp-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-warp-border">
              <h3 className="text-lg font-semibold text-warp-textBright flex items-center gap-2">
                <FileText className="w-5 h-5 text-warp-accent" />
                PR Draft
              </h3>
              <button 
                onClick={() => setShowPrModal(false)}
                className="text-warp-text hover:text-warp-textBright p-1 hover:bg-warp-bg rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="mb-4">
                <label className="text-xs font-mono text-warp-text/60 mb-1 block uppercase">PR Title</label>
                <input
                  type="text"
                  value={prDraft.title}
                  onChange={(e) => updatePrDraft('title', e.target.value)}
                  className="w-full bg-warp-bg p-3 rounded-lg border border-warp-border text-warp-textBright font-mono text-sm focus:outline-none focus:border-warp-accent/50 transition-colors"
                />
              </div>
              
              <div>
                <label className="text-xs font-mono text-warp-text/60 mb-1 block uppercase">Description</label>
                <textarea
                  value={prDraft.description}
                  onChange={(e) => updatePrDraft('description', e.target.value)}
                  rows={10}
                  className="w-full bg-warp-bg p-4 rounded-lg border border-warp-border text-warp-textBright text-sm font-mono focus:outline-none focus:border-warp-accent/50 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-warp-border flex justify-end gap-3 bg-warp-panel rounded-b-xl">
               <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${prDraft.title}\n\n${prDraft.description}`);
                  setShowPrModal(false);
                }}
                className="px-4 py-2 bg-warp-accent hover:bg-warp-accent/90 text-black font-semibold rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <Check className="w-4 h-4" />
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IssueCard;