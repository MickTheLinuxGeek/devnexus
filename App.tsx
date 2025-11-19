import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import IssueCard from './components/IssueCard';
import ResearchNotes from './components/ResearchNotes';
import NewIssueModal from './components/NewIssueModal';
import { View, Issue, GithubConfig, ResearchNote } from './types';
import { fetchIssues, createIssue } from './services/githubService';
import { Settings, Save, Terminal, Copy, Check, Info, AlertTriangle, XCircle, PlusCircle } from 'lucide-react';

const CONFIG_STORAGE_KEY = 'devnexus_github_config';

const App = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  
  // Initialize config from LocalStorage if available
  const [config, setConfig] = useState<GithubConfig>(() => {
    const defaults = { token: '', owner: 'facebook', repo: 'react' };
    if (typeof window === 'undefined') return defaults;
    
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      try {
        // Merge saved config with defaults to ensure all fields exist
        return { ...defaults, ...JSON.parse(saved) };
      } catch (e) {
        console.error("Failed to parse saved config", e);
      }
    }
    return defaults;
  });

  const [issues, setIssues] = useState<Issue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<ResearchNote[]>([
    { id: '1', title: 'Performance Optimization Strategy', content: '# Strategy\nWe need to look into React Compiler...', tags: ['perf', 'react'], created_at: new Date().toISOString() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [baseUrl, setBaseUrl] = useState(typeof window !== 'undefined' ? window.location.origin : '');
  
  // New Issue Modal State
  const [isNewIssueModalOpen, setIsNewIssueModalOpen] = useState(false);
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);

  // Initialize from URL params if present (Warp Integration)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlOwner = params.get('owner');
    const urlRepo = params.get('repo');
    const urlToken = params.get('token');

    if (urlOwner && urlRepo) {
      setConfig(prev => ({
        ...prev,
        owner: urlOwner,
        repo: urlRepo,
        token: urlToken || prev.token
      }));
      // If context is provided via URL, default to Issues view
      setCurrentView(View.ISSUES);
    }
  }, []);

  useEffect(() => {
    loadIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.owner, config.repo]); // Reload when repo changes

  const loadIssues = async () => {
    setIsLoading(true);
    setError(null);
    
    const { issues: data, error: apiError } = await fetchIssues(config);
    
    if (apiError) {
      setError(apiError);
    }
    
    setIssues(data);
    setIsLoading(false);
  };

  const handleCreateIssue = async (title: string, body: string) => {
    setIsCreatingIssue(true);
    const { issue, error: createError } = await createIssue(config, title, body);
    
    if (createError) {
      alert(`Failed to create issue: ${createError}`); // Simple alert for now, could be improved
      setIsCreatingIssue(false);
      return;
    }

    if (issue) {
      // Optimistically update or re-fetch
      setIssues(prev => [issue, ...prev]);
      setIsNewIssueModalOpen(false);
    }
    setIsCreatingIssue(false);
  };

  const getSnippet = () => {
    return `
# Add this to your .zshrc or .bashrc
# Usage: Navigate to a git folder and type 'nexus' to launch
nexus() {
  local url=$(git config --get remote.origin.url)
  if [[ -z "$url" ]]; then
    echo "❌ Not a git repository"
    return 1
  fi
  
  # Parse owner/repo from git url
  local repo_path=$(echo "$url" | sed -E 's/.*github.com[:/](.*)\\/(.*)(\\.git)?/\\1\\/\\2/' | sed 's/\\.git$//')
  local owner=$(echo "$repo_path" | cut -d'/' -f1)
  local repo=$(echo "$repo_path" | cut -d'/' -f2)
  
  local target_url="${baseUrl}/?owner=$owner&repo=$repo"

  echo "🚀 Opening DevNexus for $owner/$repo..."

  # Open DevNexus (Cross-platform support)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$target_url"
  elif command -v xdg-open > /dev/null; then
    xdg-open "$target_url"
  elif command -v wslview > /dev/null; then
    wslview "$target_url"
  else
    echo "Could not detect browser opener. Open this link:"
    echo "$target_url"
  fi
}
`.trim();
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(getSnippet());
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard issues={issues} notes={notes} />;
      
      case View.ISSUES:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <div>
                 <h2 className="text-2xl font-bold text-warp-textBright">Issue Tracker</h2>
                 <p className="text-warp-text text-sm">Tracking <span className="text-warp-accent">{config.owner}/{config.repo}</span></p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsNewIssueModalOpen(true)} 
                  className="flex items-center gap-2 px-4 py-2 bg-warp-accent hover:bg-warp-accent/90 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-warp-accent/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  New Issue
                </button>
                <button onClick={loadIssues} className="px-4 py-2 bg-warp-panel hover:bg-warp-border border border-warp-border rounded text-sm text-warp-text transition-colors">
                  Refresh
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-warp-danger/10 border border-warp-danger/20 rounded-xl p-4 flex items-start gap-3 mb-6">
                <AlertTriangle className="w-5 h-5 text-warp-danger shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-warp-textBright font-medium text-sm">Connection Error</h3>
                  <p className="text-warp-text text-sm mt-1">
                    GitHub API returned: <span className="font-mono bg-black/20 px-1 rounded">{error}</span>. 
                    Showing cached/mock data instead.
                  </p>
                  <p className="text-xs text-warp-text/60 mt-2">Check your Token settings or Rate Limits.</p>
                </div>
                <button onClick={() => setError(null)} className="text-warp-text hover:text-warp-textBright">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-48 bg-warp-panel/50 rounded-xl animate-pulse border border-warp-border/50"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {issues.filter(i => i.state === 'open').map(issue => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
                {issues.filter(i => i.state === 'open').length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed border-warp-border rounded-xl opacity-50">
                    <Check className="w-12 h-12 mb-4 text-warp-success" />
                    <p>No open issues found. Great job!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case View.RESEARCH:
        return <ResearchNotes notes={notes} setNotes={setNotes} />;

      case View.SETTINGS:
        return (
          <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
            <div className="bg-warp-panel border border-warp-border rounded-xl p-8">
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-warp-border">
                <div className="p-3 bg-warp-accent/10 rounded-full">
                  <Settings className="w-8 h-8 text-warp-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-warp-textBright">Configuration</h2>
                  <p className="text-warp-text">Connect to your GitHub repository.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-warp-text mb-2">Personal Access Token</label>
                  <input 
                    type="password" 
                    value={config.token}
                    onChange={(e) => setConfig({...config, token: e.target.value})}
                    className="w-full bg-warp-bg border border-warp-border rounded-lg px-4 py-3 text-warp-textBright focus:border-warp-accent focus:outline-none transition-colors"
                    placeholder="ghp_..."
                  />
                  
                  <div className="mt-3 p-3 bg-warp-bg/50 rounded-lg border border-warp-border/50 text-xs text-warp-text space-y-2">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-warp-accent shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-warp-textBright mb-1">Required Permissions</p>
                        <ul className="list-disc list-inside space-y-1 opacity-80">
                          <li><span className="text-warp-textBright">Classic Token:</span> <code>repo</code> (Private) or <code>public_repo</code> (Public)</li>
                          <li><span className="text-warp-textBright">Fine-grained:</span> Read-only access to <code>Issues</code> and <code>Metadata</code></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-warp-text mb-2">Owner</label>
                    <input 
                      type="text" 
                      value={config.owner}
                      onChange={(e) => setConfig({...config, owner: e.target.value})}
                      className="w-full bg-warp-bg border border-warp-border rounded-lg px-4 py-3 text-warp-textBright focus:border-warp-accent focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warp-text mb-2">Repository</label>
                    <input 
                      type="text" 
                      value={config.repo}
                      onChange={(e) => setConfig({...config, repo: e.target.value})}
                      className="w-full bg-warp-bg border border-warp-border rounded-lg px-4 py-3 text-warp-textBright focus:border-warp-accent focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <button 
                    onClick={() => {
                      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
                      loadIssues();
                      setCurrentView(View.ISSUES);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-warp-accent hover:bg-warp-accent/90 text-white font-bold rounded-lg transition-all shadow-lg shadow-warp-accent/20"
                  >
                    <Save className="w-4 h-4" />
                    Save & Connect
                  </button>
                </div>
              </div>
            </div>

            {/* Integration Helper */}
            <div className="bg-warp-panel border border-warp-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-warp-textBright mb-2 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-warp-accent" />
                Warp / CLI Integration
              </h3>
              
              <p className="text-sm text-warp-text mb-6 leading-relaxed">
                1. Add this function to your shell configuration (e.g., <code>.zshrc</code> or <code>.bashrc</code>).<br/>
                2. Run <code>source ~/.zshrc</code> to reload.<br/>
                3. Navigate to any git repository in your terminal and type <code className="bg-warp-bg px-2 py-0.5 rounded text-warp-accent font-mono">nexus</code> to launch this dashboard.
              </p>

              <div className="mb-4">
                <label className="block text-xs font-medium text-warp-text mb-1 uppercase tracking-wider">App Base URL</label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full bg-warp-bg border border-warp-border rounded-md px-3 py-2 text-warp-textBright font-mono text-sm focus:border-warp-accent focus:outline-none transition-colors"
                />
              </div>
              
              <div className="relative group">
                <div className="absolute right-2 top-2 z-10">
                  <button 
                    onClick={handleCopySnippet}
                    className={`p-2 rounded-md transition-all ${
                      copiedSnippet 
                        ? 'bg-warp-success text-white' 
                        : 'bg-warp-bg/80 text-warp-text hover:text-warp-textBright border border-warp-border'
                    }`}
                  >
                    {copiedSnippet ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <pre className="bg-warp-bg border border-warp-border p-4 rounded-lg overflow-x-auto text-xs font-mono text-warp-textBright leading-relaxed">
{getSnippet()}
                </pre>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-warp-bg text-warp-text selection:bg-warp-accent/30 selection:text-white">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        {renderContent()}
        <NewIssueModal 
          isOpen={isNewIssueModalOpen} 
          onClose={() => setIsNewIssueModalOpen(false)}
          onSubmit={handleCreateIssue}
          isSubmitting={isCreatingIssue}
        />
      </main>
    </div>
  );
};

export default App;