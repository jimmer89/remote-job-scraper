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
}

export default function SearchFilters({ onSearch, categories }: SearchFiltersProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [noPhone, setNoPhone] = useState(false);
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
  
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search input */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search jobs... (e.g., customer support, data entry)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        
        {/* Category select */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        
        {/* Search button */}
        <button
          type="submit"
          className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔍 Search
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={noPhone}
            onChange={(e) => setNoPhone(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-gray-700">📵 No Phone Required</span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={hasSalary}
            onChange={(e) => setHasSalary(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-gray-700">💰 Shows Salary</span>
        </label>
      </div>
    </form>
  );
}
