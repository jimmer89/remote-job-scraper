'use client';

import { StatsResponse } from '@/lib/api';

interface StatsBarProps {
  stats: StatsResponse | null;
}

export default function StatsBar({ stats }: StatsBarProps) {
  if (!stats) {
    return (
      <div className="stats-bar text-white py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center">
            <div className="skeleton h-5 w-64 bg-white/20"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="stats-bar text-white py-3">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 text-sm">
          {/* Total Jobs */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🌐</span>
            <span className="font-bold text-lg">{stats.total_jobs.toLocaleString()}</span>
            <span className="opacity-80">Remote Jobs</span>
          </div>
          
          <div className="hidden sm:block w-px h-5 bg-white/30" />
          
          {/* No Phone Jobs - DESTACADO */}
          <div className="flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full">
            <span className="text-xl">📵</span>
            <span className="font-bold text-lg">{stats.no_phone_jobs}</span>
            <span className="opacity-90">No-Phone Jobs</span>
          </div>
          
          <div className="hidden sm:block w-px h-5 bg-white/30" />
          
          {/* With Salary */}
          <div className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <span className="font-bold">{stats.jobs_with_salary}</span>
            <span className="opacity-80">With Salary</span>
          </div>
          
          <div className="hidden md:block w-px h-5 bg-white/30" />
          
          {/* Sources */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xl">📡</span>
            <span className="font-bold">{Object.keys(stats.by_source).length}</span>
            <span className="opacity-80">Sources</span>
          </div>
        </div>
      </div>
    </div>
  );
}
