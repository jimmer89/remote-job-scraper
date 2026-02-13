// API client for Remote Job Scraper

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Job {
  id: string;
  source: string;
  source_id: string;
  title: string;
  company: string;
  company_logo?: string;
  description?: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  url: string;
  apply_url?: string;
  tags: string[];
  category: string;
  is_no_phone: boolean;
  posted_at?: string;
  scraped_at: string;
}

export interface JobsResponse {
  count: number;
  offset: number;
  jobs: Job[];
}

export interface StatsResponse {
  total_jobs: number;
  no_phone_jobs: number;
  jobs_with_salary: number;
  by_source: Record<string, number>;
  by_category: Record<string, number>;
  last_scrape: Record<string, string>;
}

export interface Category {
  name: string;
  count: number;
}

export async function getJobs(params?: {
  category?: string;
  source?: string;
  no_phone?: boolean;
  has_salary?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<JobsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.category) searchParams.set('category', params.category);
  if (params?.source) searchParams.set('source', params.source);
  if (params?.no_phone) searchParams.set('no_phone', 'true');
  if (params?.has_salary) searchParams.set('has_salary', 'true');
  if (params?.search) searchParams.set('search', params.search);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());
  
  const res = await fetch(`${API_URL}/api/jobs?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

export async function getLazyGirlJobs(limit = 50): Promise<JobsResponse> {
  const res = await fetch(`${API_URL}/api/lazy-girl-jobs?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch lazy girl jobs');
  return res.json();
}

export async function getStats(): Promise<StatsResponse> {
  const res = await fetch(`${API_URL}/api/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function getCategories(): Promise<{ categories: Category[] }> {
  const res = await fetch(`${API_URL}/api/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export function formatSalary(min?: number, max?: number): string {
  if (!min) return '';
  
  const formatNum = (n: number) => {
    if (n >= 1000) {
      return `$${(n / 1000).toFixed(0)}k`;
    }
    return `$${n}`;
  };
  
  if (max && max !== min) {
    return `${formatNum(min)} - ${formatNum(max)}`;
  }
  return formatNum(min);
}

export function timeAgo(dateString?: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}
