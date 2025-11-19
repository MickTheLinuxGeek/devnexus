export enum View {
  DASHBOARD = 'DASHBOARD',
  ISSUES = 'ISSUES',
  RESEARCH = 'RESEARCH',
  SETTINGS = 'SETTINGS'
}

export interface GithubConfig {
  token: string;
  owner: string;
  repo: string;
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  labels: { name: string; color: string }[];
  user: { login: string; avatar_url: string };
  comments: number;
}

export interface ResearchNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  aiAnalysis?: string;
}

export interface AIAnalysisResult {
  summary: string;
  suggestedAction: string;
  priorityScore: number;
  tags: string[];
}
