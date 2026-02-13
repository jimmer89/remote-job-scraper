'use client';

import { Job, formatSalary, timeAgo } from '@/lib/api';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const salary = formatSalary(job.salary_min, job.salary_max);
  
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 hover:text-blue-600">
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              {job.title}
            </a>
          </h3>
          <p className="text-gray-600 mt-1">{job.company}</p>
        </div>
        {job.company_logo && (
          <img 
            src={job.company_logo} 
            alt={job.company}
            className="w-12 h-12 rounded-lg object-contain ml-4"
          />
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {job.is_no_phone && (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            📵 No Phone
          </span>
        )}
        {job.category && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            {job.category}
          </span>
        )}
        {salary && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
            💰 {salary}
          </span>
        )}
        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
          {job.source}
        </span>
      </div>
      
      {job.description && (
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">
          {job.description.substring(0, 200)}...
        </p>
      )}
      
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <span className="text-gray-400 text-sm">
          📍 {job.location}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">
            {timeAgo(job.scraped_at)}
          </span>
          <a
            href={job.apply_url || job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply →
          </a>
        </div>
      </div>
    </div>
  );
}
