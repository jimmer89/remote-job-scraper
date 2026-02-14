'use client';

import { useState, useEffect } from 'react';
import JobCard from '@/components/JobCard';
import SearchFilters from '@/components/SearchFilters';
import Quiz, { QuizAnswers } from '@/components/Quiz';
import StatsBar from '@/components/StatsBar';
import { Job, StatsResponse, getJobs, getStats, getLazyGirlJobs } from '@/lib/api';

type ViewMode = 'landing' | 'quiz' | 'results';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null);
  const [resultCount, setResultCount] = useState(0);
  
  // Load stats on mount
  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(console.error);
  }, []);
  
  // Handle search
  const handleSearch = async (filters: {
    search?: string;
    category?: string;
    noPhone?: boolean;
    hasSalary?: boolean;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getJobs({
        search: filters.search,
        category: filters.category,
        no_phone: filters.noPhone,
        has_salary: filters.hasSalary,
        limit: 50,
      });
      setJobs(response.jobs);
      setResultCount(response.count);
      setViewMode('results');
    } catch (err) {
      setError('Failed to fetch jobs. Make sure the API is running.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle quiz completion
  const handleQuizComplete = async (answers: QuizAnswers) => {
    setQuizAnswers(answers);
    setLoading(true);
    setError(null);
    
    try {
      if (answers.noPhone) {
        const response = await getLazyGirlJobs(50);
        const filtered = answers.categories.length > 0
          ? response.jobs.filter(j => answers.categories.includes(j.category))
          : response.jobs;
        setJobs(filtered.length > 0 ? filtered : response.jobs);
        setResultCount(filtered.length > 0 ? filtered.length : response.count);
      } else {
        const response = await getJobs({
          category: answers.categories[0],
          limit: 50,
        });
        setJobs(response.jobs);
        setResultCount(response.count);
      }
      setViewMode('results');
    } catch (err) {
      setError('Failed to fetch jobs. Make sure the API is running.');
    } finally {
      setLoading(false);
    }
  };
  
  const categories = stats ? Object.keys(stats.by_category) : [];
  
  return (
    <main className="min-h-screen">
      <StatsBar stats={stats} />
      
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setViewMode('landing')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                <span className="text-white text-xl">🌴</span>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">
                  ChillJobs
                </h1>
                <p className="text-text-muted text-xs">Remote jobs, no stress</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {viewMode !== 'quiz' && (
                <button
                  onClick={() => setViewMode('quiz')}
                  className="px-5 py-2 bg-gradient-to-r from-primary to-pink-500 text-white font-medium rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
                >
                  ✨ Take the Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Landing View */}
        {viewMode === 'landing' && (
          <div className="animate-fadeIn">
            {/* Hero Section */}
            <div className="text-center mb-12 pt-8">
              {/* Floating badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-6 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-text-secondary">
                  {stats?.no_phone_jobs || 0}+ jobs that don't require phone calls
                </span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-bold text-text mb-6 leading-tight">
                Remote Jobs Without<br />
                <span className="gradient-text">
                  The Phone Anxiety
                </span>
              </h2>
              
              <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
                Find your perfect remote job from <strong>{stats?.total_jobs.toLocaleString() || '600'}+</strong> curated positions. 
                Filter by no-phone requirement, salary, and more.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button
                  onClick={() => handleSearch({ noPhone: true })}
                  className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-secondary to-teal-400 text-white font-semibold rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all text-lg"
                >
                  <span className="text-2xl">📵</span>
                  Browse No-Phone Jobs
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button
                  onClick={() => setViewMode('quiz')}
                  className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-pink-500 text-white font-semibold rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all text-lg"
                >
                  <span className="text-2xl">✨</span>
                  Find My Perfect Job
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-text-muted mb-12">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Updated every 6 hours
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> No signup required
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 100% free to browse
                </div>
              </div>
            </div>
            
            {/* Search Filters */}
            <SearchFilters onSearch={handleSearch} categories={categories} />
            
            {/* Category Cards */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-text mb-4">Browse by Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { cat: 'support', emoji: '💬', label: 'Customer Support', color: 'from-blue-400 to-blue-600' },
                  { cat: 'dev', emoji: '💻', label: 'Development', color: 'from-purple-400 to-purple-600' },
                  { cat: 'design', emoji: '🎨', label: 'Design', color: 'from-pink-400 to-pink-600' },
                  { cat: 'marketing', emoji: '📈', label: 'Marketing', color: 'from-orange-400 to-orange-600' },
                  { cat: 'data-entry', emoji: '📊', label: 'Data Entry', color: 'from-green-400 to-green-600' },
                  { cat: 'va', emoji: '📋', label: 'Virtual Assistant', color: 'from-teal-400 to-teal-600' },
                  { cat: 'writing', emoji: '✍️', label: 'Writing', color: 'from-indigo-400 to-indigo-600' },
                  { cat: 'sales', emoji: '🤝', label: 'Sales', color: 'from-yellow-400 to-yellow-600' },
                ].map(({ cat, emoji, label, color }) => (
                  <button
                    key={cat}
                    onClick={() => handleSearch({ category: cat })}
                    className="group card p-5 text-center hover:border-primary/50 hover:-translate-y-1 transition-all"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                      <span className="text-2xl">{emoji}</span>
                    </div>
                    <span className="font-medium text-text">{label}</span>
                    <span className="text-text-muted text-sm block mt-1">
                      {stats?.by_category[cat] || 0} jobs
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Features Section */}
            <div className="card p-8 mb-8 bg-gradient-to-br from-primary/5 to-pink-500/5">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-text mb-2">Why ChillJobs?</h3>
                <p className="text-text-secondary">Built for people who want remote work without the phone stress</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📵</span>
                  </div>
                  <h4 className="font-semibold text-text mb-2">No-Phone Filter</h4>
                  <p className="text-text-secondary text-sm">
                    The only job board that lets you filter specifically for jobs without phone requirements
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h4 className="font-semibold text-text mb-2">Smart Matching</h4>
                  <p className="text-text-secondary text-sm">
                    Take our quiz to find jobs that match your skills and preferences perfectly
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">💰</span>
                  </div>
                  <h4 className="font-semibold text-text mb-2">Salary Transparency</h4>
                  <p className="text-text-secondary text-sm">
                    Filter for jobs that show salary upfront. No more guessing games
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Quiz View */}
        {viewMode === 'quiz' && (
          <div className="py-8 animate-fadeIn">
            <button
              onClick={() => setViewMode('landing')}
              className="flex items-center gap-2 text-text-secondary hover:text-text mb-6 transition-colors"
            >
              ← Back to home
            </button>
            <Quiz onComplete={handleQuizComplete} />
          </div>
        )}
        
        {/* Results View */}
        {viewMode === 'results' && (
          <div className="animate-fadeIn">
            <SearchFilters 
              onSearch={handleSearch} 
              categories={categories} 
              initialNoPhone={quizAnswers?.noPhone}
            />
            
            {loading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-text-secondary">Finding your perfect jobs...</p>
              </div>
            ) : error ? (
              <div className="card text-center py-12">
                <div className="text-4xl mb-4">😕</div>
                <p className="text-red-500 mb-4">{error}</p>
                <p className="text-text-muted text-sm">
                  Make sure the API is running: <code className="bg-bg px-2 py-1 rounded">uvicorn src.api:app --port 8000</code>
                </p>
              </div>
            ) : (
              <>
                {/* Results header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-text">
                      {resultCount} jobs found
                    </h2>
                    {quizAnswers?.noPhone && (
                      <p className="text-text-secondary text-sm mt-1">
                        Filtered for no-phone positions based on your quiz
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setViewMode('landing')}
                    className="text-primary hover:underline font-medium"
                  >
                    ← New search
                  </button>
                </div>
                
                {/* Job list */}
                <div className="grid gap-4">
                  {jobs.map((job, index) => (
                    <div 
                      key={job.id} 
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <JobCard job={job} />
                    </div>
                  ))}
                </div>
                
                {/* Empty state */}
                {jobs.length === 0 && (
                  <div className="card text-center py-16">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-text mb-2">No jobs found</h3>
                    <p className="text-text-secondary mb-6">
                      Try adjusting your filters or search terms
                    </p>
                    <button
                      onClick={() => handleSearch({})}
                      className="btn-primary"
                    >
                      View all jobs
                    </button>
                  </div>
                )}
                
                {/* Load more placeholder */}
                {jobs.length >= 50 && (
                  <div className="text-center py-8">
                    <p className="text-text-muted">
                      Showing first 50 results. More coming soon with Pro! 🚀
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-text text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                  <span className="text-white text-xl">🌴</span>
                </div>
                <span className="text-xl font-bold">ChillJobs</span>
              </div>
              <p className="text-gray-400 text-sm">
                Find your perfect remote job without the phone anxiety. 
                Updated every 6 hours from 5+ trusted sources.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Customer Support</a>
                <a href="#" className="hover:text-white transition-colors">Development</a>
                <a href="#" className="hover:text-white transition-colors">Design</a>
                <a href="#" className="hover:text-white transition-colors">Marketing</a>
                <a href="#" className="hover:text-white transition-colors">Data Entry</a>
                <a href="#" className="hover:text-white transition-colors">Writing</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Sources</h4>
              <p className="text-sm text-gray-400">
                We aggregate jobs from RemoteOK, WeWorkRemotely, Reddit, Indeed, Glassdoor and more.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              Built with 🦜 by PepLlu & Jaume • © 2026 ChillJobs
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
