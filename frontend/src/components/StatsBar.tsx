'use client';

import { StatsResponse } from '@/lib/api';

interface StatsBarProps {
  stats: StatsResponse | null;
}

export default function StatsBar({ stats }: StatsBarProps) {
  if (!stats) return null;
  
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold">{stats.total_jobs.toLocaleString()}</span>
            <span className="opacity-80">Remote Jobs</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/30" />
          <div className="flex items-center gap-2">
            <span className="font-bold">{stats.no_phone_jobs}</span>
            <span className="opacity-80">No-Phone Jobs</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/30" />
          <div className="flex items-center gap-2">
            <span className="font-bold">{stats.jobs_with_salary}</span>
            <span className="opacity-80">With Salary Info</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/30" />
          <div className="flex items-center gap-2">
            <span className="font-bold">{Object.keys(stats.by_source).length}</span>
            <span className="opacity-80">Sources</span>
          </div>
        </div>
      </div>
    </div>
  );
}
