'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import JobCard from '@/components/JobCard';
import SearchFilters from '@/components/SearchFilters';
import Quiz, { QuizAnswers } from '@/components/Quiz';
import StatsBar from '@/components/StatsBar';
import UpgradeModal from '@/components/UpgradeModal';
import LockedJobCard from '@/components/LockedJobCard';
import { useProStatus, FREE_JOB_LIMIT } from '@/hooks/useProStatus';
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  
  const { data: session } = useSession();
  const { isPro, isAuthenticated } = useProStatus();
  
  // Show upgrade modal for Pro features
  const requirePro = (feature: string) => {
    if (!isPro) {
      setUpgradeFeature(feature);
      setShowUpgradeModal(true);
      return true; // blocked
    }
    return false; // allowed
  };
  
  // Load stats on mount
  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(console.error);
  }, []);
  
  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state?.viewMode) {
        setViewMode(state.viewMode);
        if (state.jobs) setJobs(state.jobs);
        if (state.resultCount) setResultCount(state.resultCount);
      } else {
        setViewMode('landing');
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // Set initial state
    if (!window.history.state?.viewMode) {
      window.history.replaceState({ viewMode: 'landing' }, '', '/');
    }
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  // Custom setViewMode that updates history
  const changeView = (newView: ViewMode, pushHistory = true) => {
    setViewMode(newView);
    if (pushHistory) {
      const url = newView === 'landing' ? '/' : newView === 'quiz' ? '/?quiz' : '/?results';
      window.history.pushState(
        { viewMode: newView, jobs, resultCount }, 
        '', 
        url
      );
    }
  };
  
  // Handle search
  const handleSearch = async (filters: {
    search?: string;
    category?: string;
    noPhone?: boolean;
    hasSalary?: boolean;
  }) => {
    console.log('handleSearch called with:', filters);
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
      console.log('API response:', response);
      setJobs(response.jobs);
      setResultCount(response.count);
      changeView('results');
    } catch (err) {
      console.error('Search error:', err);
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
      changeView('results');
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
              onClick={() => changeView('landing')}
            >
              <img 
                src="/logo.png" 
                alt="ChillJobs" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold gradient-text">
                  ChillJobs
                </h1>
                <p className="text-text-muted text-xs">No calls required</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {viewMode !== 'quiz' && (
                <button
                  onClick={() => changeView('quiz')}
                  className="px-5 py-2 bg-gradient-to-r from-primary to-pink-500 text-white font-medium rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
                >
                  ✨ Take the Quiz
                </button>
              )}
              
              {/* Auth buttons */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  {isPro && (
                    <span className="px-2 py-1 bg-gradient-to-r from-primary to-pink-500 text-white text-xs font-bold rounded-full">
                      PRO
                    </span>
                  )}
                  <div className="relative group">
                    <button className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {session?.user?.name?.[0]?.toUpperCase() || '?'}
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-border py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="font-medium text-sm truncate">{session?.user?.name}</p>
                        <p className="text-xs text-text-muted truncate">{session?.user?.email}</p>
                      </div>
                      {!isPro && (
                        <a href="/pricing" className="block px-4 py-2 text-sm text-primary hover:bg-primary/5">
                          ⬆️ Upgrade to Pro
                        </a>
                      )}
                      <button 
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <a
                  href="/auth/signin"
                  className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-full transition-colors"
                >
                  Sign In
                </a>
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
                Remote Jobs.<br />
                <span className="gradient-text">
                  No Calls Required.
                </span>
              </h2>
              
              <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
                Find your perfect remote job from <strong>{stats?.total_jobs.toLocaleString() || '600'}+</strong> curated positions. 
                Filter by no-phone requirement, salary, and more.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button
                  onClick={() => {
                    if (!requirePro('No-Phone filter')) {
                      handleSearch({ noPhone: true });
                    }
                  }}
                  className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-secondary to-teal-400 text-white font-semibold rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all text-lg"
                >
                  <span className="text-2xl">📵</span>
                  Browse No-Phone Jobs
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                  {!isPro && (
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-accent text-white text-xs font-bold rounded-full">
                      PRO
                    </span>
                  )}
                </button>
                <button
                  onClick={() => changeView('quiz')}
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
                  <span className="text-green-500">✓</span> 1 free job preview
                </div>
              </div>
            </div>
            
            {/* Search Filters */}
            <SearchFilters 
              onSearch={handleSearch} 
              categories={categories} 
              isPro={isPro}
              onRequirePro={requirePro}
            />
            
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
                <p className="text-text-secondary">Built for people who want remote work without the calls</p>
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
              onClick={() => changeView('landing')}
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
              isPro={isPro}
              onRequirePro={requirePro}
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
                    onClick={() => changeView('landing')}
                    className="text-primary hover:underline font-medium"
                  >
                    ← New search
                  </button>
                </div>
                
                {/* Job list */}
                <div className="grid gap-4">
                  {/* Show visible jobs (5 for free, all for Pro) */}
                  {jobs.slice(0, isPro ? jobs.length : FREE_JOB_LIMIT).map((job, index) => (
                    <div 
                      key={job.id} 
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <JobCard job={job} />
                    </div>
                  ))}
                  
                  {/* Show locked cards for free users */}
                  {!isPro && jobs.length > FREE_JOB_LIMIT && (
                    <>
                      {Array.from({ length: Math.min(3, jobs.length - FREE_JOB_LIMIT) }).map((_, i) => (
                        <LockedJobCard 
                          key={`locked-${i}`} 
                          onClick={() => requirePro('unlimited jobs')} 
                        />
                      ))}
                      
                      {/* Unlock banner */}
                      <div className="bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-xl p-6 text-center border-2 border-dashed border-primary/30">
                        <div className="text-4xl mb-3">🔓</div>
                        <h3 className="text-lg font-bold mb-2">
                          +{jobs.length - FREE_JOB_LIMIT} more jobs available
                        </h3>
                        <p className="text-text-muted mb-4">
                          Unlock all {stats?.no_phone_jobs || 250}+ no-phone jobs with Pro
                        </p>
                        <button
                          onClick={() => requirePro('unlimited jobs')}
                          className="px-6 py-3 bg-gradient-to-r from-primary to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                        >
                          Unlock All Jobs - $9.99/mo
                        </button>
                      </div>
                    </>
                  )}
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
                
                {/* Load more for Pro users */}
                {isPro && jobs.length >= 50 && (
                  <div className="text-center py-8">
                    <p className="text-text-muted">
                      Showing first 50 results. Pagination coming soon! 🚀
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-text text-white pt-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/logo.png" 
                  alt="ChillJobs" 
                  className="w-14 h-14 object-contain"
                />
                <span className="text-xl font-bold">ChillJobs</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Find your perfect remote job. No calls required. 
                Updated every 6 hours from 5+ trusted sources.
              </p>
              {/* Social links */}
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-lg bg-gray-700 hover:bg-primary flex items-center justify-center transition-colors" aria-label="Twitter">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-gray-700 hover:bg-primary flex items-center justify-center transition-colors" aria-label="LinkedIn">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-gray-700 hover:bg-primary flex items-center justify-center transition-colors" aria-label="Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Customer Support</a>
                <a href="#" className="hover:text-white transition-colors">Development</a>
                <a href="#" className="hover:text-white transition-colors">Design</a>
                <a href="#" className="hover:text-white transition-colors">Marketing</a>
                <a href="#" className="hover:text-white transition-colors">Data Entry</a>
                <a href="#" className="hover:text-white transition-colors">Writing</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Why ChillJobs?</a>
                <a href="#" className="hover:text-white transition-colors">Remote Work Tips</a>
                <a href="#" className="hover:text-white transition-colors">Salary Guide</a>
                <a href="#" className="hover:text-white transition-colors">For Employers</a>
                <a href="#" className="hover:text-white transition-colors">Contact Support</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Sources</h4>
              <p className="text-sm text-gray-400 mb-4">
                We aggregate jobs from RemoteOK, WeWorkRemotely, Reddit, Indeed, Glassdoor and more.
              </p>
              <h4 className="font-semibold mb-2 mt-4">Newsletter</h4>
              <p className="text-sm text-gray-400 mb-2">Get new jobs in your inbox</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="you@email.com" 
                  className="flex-1 px-3 py-2 bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg text-sm font-medium transition-colors">
                  →
                </button>
              </div>
            </div>
          </div>
          {/* Bottom bar */}
          <div className="border-t border-gray-700 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 ChillJobs • Built with 🦜 by PepLlu & Jaume
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Guidelines</a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
      />
    </main>
  );
}
