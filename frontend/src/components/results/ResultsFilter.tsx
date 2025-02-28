'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ResultsFilterProps {
  models: string[];
  benchmarkTypes: string[];
  onFilterChange: (filters: {
    model?: string;
    benchmarkType?: string;
    dateRange?: string;
  }) => void;
}

const ResultsFilter: React.FC<ResultsFilterProps> = ({
  models,
  benchmarkTypes,
  onFilterChange,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleFilterChange = (
    key: string,
    value: string | null
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    router.push(`?${params.toString()}`);
    onFilterChange({
      [key]: value || undefined,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Model
          </label>
          <select
            id="model"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md dark:text-white"
            defaultValue={searchParams.get('model') || ''}
            onChange={(e) => handleFilterChange('model', e.target.value || null)}
          >
            <option value="">All Models</option>
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="benchmarkType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Benchmark Type
          </label>
          <select
            id="benchmarkType"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md dark:text-white"
            defaultValue={searchParams.get('benchmarkType') || ''}
            onChange={(e) => handleFilterChange('benchmarkType', e.target.value || null)}
          >
            <option value="">All Types</option>
            {benchmarkTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Range
          </label>
          <select
            id="dateRange"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md dark:text-white"
            defaultValue={searchParams.get('dateRange') || ''}
            onChange={(e) => handleFilterChange('dateRange', e.target.value || null)}
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ResultsFilter; 