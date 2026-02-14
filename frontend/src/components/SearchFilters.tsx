'use client';

import { useState } from 'react';

interface SearchFiltersProps {
  onSearch: (filters: {
    search?: string;
    category?: string;
    noPhone?: boolean;
    hasSalary?: boolean;
  }) => void;
  categories: string[];
  initialNoPhone?: boolean;
}

const categoryLabels: Record<string, { emoji: string; label: string }> = {
  'support': { emoji: '💬', label: 'Customer Support' },
  'dev': { emoji: '💻', label: 'Development' },
  'design': { emoji: '🎨', label: 'Design' },
  'marketing': { emoji: '📈', label: 'Marketing' },
  'data-entry': { emoji: '📊', label: 'Data Entry' },
  'va': { emoji: '📋', label: 'Virtual Assistant' },
  'writing': { emoji: '✍️', label: 'Writing' },
  'sales': { emoji: '🤝', label: 'Sales' },
  'hr': { emoji: '👥', label: 'HR' },
  'moderation': { emoji: '🛡️', label: 'Moderation' },
  'other': { emoji: '📁', label: 'Other' },
};

export default function SearchFilters({ onSearch, categories, initialNoPhone = false }: SearchFiltersProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [noPhone, setNoPhone] = useState(initialNoPhone);
  const [hasSalary, setHasSalary] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      search: search || undefined,
      category: category || undefined,
      noPhone,
      hasSalary,
    });
  };
  
  const handleQuickFilter = (cat: string) => {
    setCategory(cat);
    onSearch({
      search: search || undefined,
      category: cat || undefined,
      noPhone,
      hasSalary,
    });
  };

  const toggleNoPhone = () => {
    const newValue = !noPhone;
    setNoPhone(newValue);
    onSearch({
      search: search || undefined,
      category: category || undefined,
      noPhone: newValue,
      hasSalary,
    });
  };

  const toggleHasSalary = () => {
    const newValue = !hasSalary;
    setHasSalary(newValue);
    onSearch({
      search: search || undefined,
      category: category || undefined,
      noPhone,
      hasSalary: newValue,
    });
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setNoPhone(false);
    setHasSalary(false);
    onSearch({});
  };

  const hasActiveFilters = search || category || noPhone || hasSalary;
  
  return (
    <div className="mb-8 space-y-4 animate-fadeIn">
      {/* Main search bar */}
      <form onSubmit={handleSubmit} className="card p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search input */}
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search jobs by title, company, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-bg border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          
          {/* Category select */}
          <select
            value={category}
            onChange={(e) => handleQuickFilter(e.target.value)}
            className="px-4 py-3 bg-bg border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none min-w-[180px]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => {
              const info = categoryLabels[cat] || { emoji: '📁', label: cat };
              return (
                <option key={cat} value={cat}>
                  {info.emoji} {info.label}
                </option>
              );
            })}
          </select>
          
          {/* Search button */}
          <button
            type="submit"
            className="btn-primary whitespace-nowrap"
          >
            Search Jobs
          </button>
        </div>
      </form>
      
      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-3">
        {/* No Phone filter - PROMINENTE */}
        <button
          onClick={toggleNoPhone}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all
            ${noPhone 
              ? 'bg-secondary text-white shadow-md' 
              : 'bg-white border-2 border-secondary text-secondary hover:bg-secondary/10'
            }
          `}
        >
          <span className="text-lg">📵</span>
          No Phone Required
          {noPhone && <span className="ml-1">✓</span>}
        </button>
        
        {/* Has Salary filter */}
        <button
          onClick={toggleHasSalary}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all
            ${hasSalary 
              ? 'bg-accent text-white shadow-md' 
              : 'bg-white border-2 border-accent text-accent hover:bg-accent/10'
            }
          `}
        >
          <span className="text-lg">💰</span>
          Shows Salary
          {hasSalary && <span className="ml-1">✓</span>}
        </button>
        
        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-text-muted hover:text-text transition-colors"
          >
            ✕ Clear filters
          </button>
        )}
      </div>
      
      {/* Quick category pills */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(categoryLabels).slice(0, 8).map(([cat, info]) => (
          <button
            key={cat}
            onClick={() => handleQuickFilter(cat === category ? '' : cat)}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${category === cat
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-text-secondary hover:bg-primary/10 hover:text-primary border border-border'
              }
            `}
          >
            {info.emoji} {info.label}
          </button>
        ))}
      </div>
    </div>
  );
}
