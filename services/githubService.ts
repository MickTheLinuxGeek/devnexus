import { GithubConfig, Issue } from '../types';

const MOCK_ISSUES: Issue[] = [
  {
    id: 101,
    number: 42,
    title: "Memory leak in WebSocket connection",
    body: "After about 2 hours of continuous uptime, the memory usage spikes by 400MB. I suspect the event listeners aren't being cleaned up in the `SocketProvider`.",
    state: 'open',
    html_url: '#',
    created_at: new Date().toISOString(),
    labels: [{ name: 'bug', color: 'd73a4a' }, { name: 'urgent', color: 'b60205' }],
    user: { login: 'dev_guru', avatar_url: 'https://picsum.photos/40/40?random=1' },
    comments: 3
  },
  {
    id: 102,
    number: 45,
    title: "Add support for dark mode toggling",
    body: "Users are requesting a manual toggle for dark mode instead of relying solely on system preference.",
    state: 'open',
    html_url: '#',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    labels: [{ name: 'feature', color: 'a2eeef' }],
    user: { login: 'frontend_wiz', avatar_url: 'https://picsum.photos/40/40?random=2' },
    comments: 1
  },
  {
    id: 103,
    number: 51,
    title: "Refactor Authentication Middleware",
    body: "The current auth middleware is too coupled with the user service. We need to extract it into a standalone package.",
    state: 'closed',
    html_url: '#',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    labels: [{ name: 'refactor', color: 'cfd3d7' }],
    user: { login: 'arch_lead', avatar_url: 'https://picsum.photos/40/40?random=3' },
    comments: 5
  }
];

export const fetchIssues = async (config: GithubConfig): Promise<{ issues: Issue[], error?: string }> => {
  // Sanitize inputs to remove accidental whitespace from copy-pasting
  const owner = config.owner?.trim();
  const repo = config.repo?.trim();
  const token = config.token?.trim();

  // If no owner/repo specified, return mock data immediately
  if (!owner || !repo) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ issues: MOCK_ISSUES }), 800);
    });
  }

  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  // Only add Authorization header if token is present.
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // Fetch 'all' states to populate dashboard stats (Open vs Closed)
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100`, {
      headers
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      
      // Handle 404 explicitly as it's common with permissions issues on Private repos
      if (response.status === 404) {
        errorMessage = "Repository not found. Check spelling or token permissions (Private repos require 'repo' scope).";
      } else {
        try {
          const errorBody = await response.json();
          errorMessage = errorBody.message || errorBody.error || response.statusText || "Unknown API Error";
        } catch (e) {
          // Fallback if JSON parsing fails
          errorMessage = `HTTP Error ${response.status}`;
        }
      }
      
      console.warn(`GitHub API Error: ${errorMessage}`);
      
      // Return error message AND mock data so the UI doesn't break completely
      return { issues: MOCK_ISSUES, error: errorMessage };
    }

    const data = await response.json();
    return { issues: data as Issue[] };
  } catch (error) {
    console.error("Failed to fetch issues", error);
    return { 
      issues: MOCK_ISSUES, 
      error: error instanceof Error ? error.message : "Network connection failed" 
    };
  }
};

export const createIssue = async (config: GithubConfig, title: string, body: string): Promise<{ issue?: Issue, error?: string }> => {
  const owner = config.owner?.trim();
  const repo = config.repo?.trim();
  const token = config.token?.trim();

  if (!owner || !repo) {
    return { error: "Owner and Repository must be set." };
  }

  if (!token) {
    return { error: "Personal Access Token is required to create issues." };
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, body })
    });

    if (!response.ok) {
      const errorBody = await response.json();
      return { error: errorBody.message || response.statusText };
    }

    const data = await response.json();
    return { issue: data as Issue };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Network error during creation" };
  }
};