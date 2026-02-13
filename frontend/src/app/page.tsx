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
      // Fetch jobs based on quiz answers
      if (answers.noPhone) {
        const response = await getLazyGirlJobs(50);
        // Filter by categories if specified
        const filtered = answers.categories.length > 0
          ? response.jobs.filter(j => answers.categories.includes(j.category))
          : response.jobs;
        setJobs(filtered.length > 0 ? filtered : response.jobs);
      } else {
        const response = await getJobs({
          category: answers.categories[0],
          limit: 50,
        });
        setJobs(response.jobs);
      }
      setViewMode('results');
    } catch (err) {
      setError('Failed to fetch jobs. Make sure the API is running.');
    } finally {
      setLoading(false);
    }
  };
  
  // Categories for filter
  const categories = stats ? Object.keys(stats.by_category) : [];
  
  return (
    <main className="min-h-screen bg-gray-50">
      <StatsBar stats={stats} />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 
                className="text-2xl font-bold text-gray-900 cursor-pointer"
                onClick={() => setViewMode('landing')}
              >
                🔍 Remote Job Finder
              </h1>
              <p className="text-gray-500 text-sm">Find your perfect remote job</p>
            </div>
            {viewMode !== 'quiz' && (
              <button
                onClick={() => setViewMode('quiz')}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                ✨ Take the Quiz
              </button>
            )}
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Landing View */}
        {viewMode === 'landing' && (
          <div>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Find Your Dream<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Remote Job
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                {stats?.total_jobs.toLocaleString()}+ remote jobs from {Object.keys(stats?.by_source || {}).length} sources.
                Updated every 6 hours. No signup required.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => handleSearch({ noPhone: true })}
                  className="px-8 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-lg"
                >
                  📵 Browse No-Phone Jobs
                </button>
                <button
                  onClick={() => setViewMode('quiz')}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity text-lg"
                >
                  ✨ Find Jobs For Me
                </button>
              </div>
            </div>
            
            {/* Search */}
            <SearchFilters onSearch={handleSearch} categories={categories} />
            
            {/* Category Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { cat: 'support', emoji: '💬', label: 'Customer Support' },
                { cat: 'dev', emoji: '💻', label: 'Development' },
                { cat: 'design', emoji: '🎨', label: 'Design' },
                { cat: 'marketing', emoji: '📈', label: 'Marketing' },
                { cat: 'data-entry', emoji: '📊', label: 'Data Entry' },
                { cat: 'va', emoji: '📋', label: 'Virtual Assistant' },
                { cat: 'writing', emoji: '✍️', label: 'Writing' },
                { cat: 'sales', emoji: '🤝', label: 'Sales' },
              ].map(({ cat, emoji, label }) => (
                <button
                  key={cat}
                  onClick={() => handleSearch({ category: cat })}
                  className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow text-center"
                >
                  <span className="text-3xl mb-2 block">{emoji}</span>
                  <span className="font-medium text-gray-700">{label}</span>
                  <span className="text-gray-400 text-sm block">
                    {stats?.by_category[cat] || 0} jobs
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Quiz View */}
        {viewMode === 'quiz' && (
          <div className="py-8">
            <Quiz onComplete={handleQuizComplete} />
          </div>
        )}
        
        {/* Results View */}
        {viewMode === 'results' && (
          <div>
            <SearchFilters onSearch={handleSearch} categories={categories} />
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-500">Finding perfect jobs for you...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <p className="text-gray-500 text-sm">
                  Make sure the API is running: <code className="bg-gray-100 px-2 py-1 rounded">uvicorn src.api:app --port 8000</code>
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {jobs.length} jobs found
                    {quizAnswers?.noPhone && ' (No-Phone)'}
                  </h2>
                  <button
                    onClick={() => setViewMode('landing')}
                    className="text-blue-600 hover:underline"
                  >
                    ← Back to search
                  </button>
                </div>
                
                <div className="grid gap-4">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
                
                {jobs.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No jobs found matching your criteria.</p>
                    <button
                      onClick={() => handleSearch({})}
                      className="mt-4 text-blue-600 hover:underline"
                    >
                      View all jobs
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            Data aggregated from RemoteOK, WeWorkRemotely, Reddit & more.
            Updated every 6 hours.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Built with 🦜 by PepLlu & Jaume
          </p>
        </div>
      </footer>
    </main>
  );
}
