'use client';

import { Job, formatSalary, timeAgo } from '@/lib/api';

interface JobCardProps {
  job: Job;
}

const categoryEmojis: Record<string, string> = {
  'support': '💬',
  'dev': '💻',
  'design': '🎨',
  'marketing': '📈',
  'data-entry': '📊',
  'va': '📋',
  'writing': '✍️',
  'sales': '🤝',
  'hr': '👥',
  'moderation': '🛡️',
  'other': '📁',
};

export default function JobCard({ job }: JobCardProps) {
  const salary = formatSalary(job.salary_min, job.salary_max);
  const categoryEmoji = categoryEmojis[job.category] || '📁';
  const postedTime = timeAgo(job.scraped_at);
  const isNew = postedTime.includes('m ago') || postedTime.includes('h ago') || postedTime === 'just now';
  
  return (
    <article className="card p-5 hover:border-primary-light group animate-fadeIn">
      {/* Top row: Company info + badges */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Company logo or initial */}
          {job.company_logo ? (
            <img 
              src={job.company_logo} 
              alt={job.company}
              className="w-12 h-12 rounded-xl object-contain bg-gray-50 flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-light to-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">
                {job.company?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )}
          
          <div className="min-w-0">
            <h3 className="font-semibold text-lg text-text line-clamp-1 group-hover:text-primary transition-colors">
              <a 
                href={job.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline decoration-primary/50 underline-offset-2"
              >
                {job.title}
              </a>
            </h3>
            <p className="text-text-secondary text-sm truncate">{job.company}</p>
          </div>
        </div>
        
        {/* Time badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isNew && (
            <span className="badge bg-blue-100 text-blue-700">
              ✨ New
            </span>
          )}
          <span className="text-text-muted text-sm whitespace-nowrap">
            {postedTime}
          </span>
        </div>
      </div>
      
      {/* Badges row */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* No Phone badge - PROMINENTE */}
        {job.is_no_phone && (
          <span className="badge badge-no-phone text-sm font-bold animate-pulse-slow">
            📵 No Phone Required
          </span>
        )}
        
        {/* Salary badge */}
        {salary && (
          <span className="badge badge-salary">
            💰 {salary}
          </span>
        )}
        
        {/* Category badge */}
        {job.category && (
          <span className="badge badge-category">
            {categoryEmoji} {job.category.charAt(0).toUpperCase() + job.category.slice(1)}
          </span>
        )}
        
        {/* Source badge */}
        <span className="badge badge-source">
          {job.source}
        </span>
      </div>
      
      {/* Description preview */}
      {job.description && (
        <p className="text-text-secondary text-sm line-clamp-2 mb-4 leading-relaxed">
          {job.description.substring(0, 180)}...
        </p>
      )}
      
      {/* Bottom row: Location + Apply button */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-4 text-sm text-text-muted">
          <span className="flex items-center gap-1">
            📍 {job.location || 'Remote'}
          </span>
          {job.tags && job.tags.length > 0 && (
            <span className="hidden sm:flex items-center gap-1">
              🏷️ {job.tags.slice(0, 2).join(', ')}
            </span>
          )}
        </div>
        
        <a
          href={job.apply_url || job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-sm py-2 px-5 flex items-center gap-2 group/btn"
        >
          Apply Now
          <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
        </a>
      </div>
    </article>
  );
}
