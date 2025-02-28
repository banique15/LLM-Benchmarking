'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ResultsSortProps {
  onSortChange: (sort: {
    field: string;
    direction: 'asc' | 'desc';
  }) => void;
}

const ResultsSort: React.FC<ResultsSortProps> = ({ onSortChange }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSortChange = (field: string) => {
    const currentField = searchParams.get('sortField') || 'date';
    const currentDirection = searchParams.get('sortDirection') || 'desc';
    
    let newDirection: 'asc' | 'desc' = 'desc';
    if (field === currentField) {
      newDirection = currentDirection === 'desc' ? 'asc' : 'desc';
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('sortField', field);
    params.set('sortDirection', newDirection);
    
    router.push(`?${params.toString()}`);
    onSortChange({ field, direction: newDirection });
  };

  const getSortIcon = (field: string) => {
    const currentField = searchParams.get('sortField') || 'date';
    const currentDirection = searchParams.get('sortDirection') || 'desc';

    if (field !== currentField) {
      return (
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return currentDirection === 'desc' ? (
      <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    ) : (
      <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    );
  };

  return (
    <div className="flex items-center space-x-4 mb-6">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
      <div className="flex space-x-2">
        <button
          onClick={() => handleSortChange('date')}
          className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
            searchParams.get('sortField') === 'date' || !searchParams.get('sortField')
              ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          Date
          <span className="ml-1.5">{getSortIcon('date')}</span>
        </button>
        <button
          onClick={() => handleSortChange('score')}
          className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
            searchParams.get('sortField') === 'score'
              ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          Score
          <span className="ml-1.5">{getSortIcon('score')}</span>
        </button>
        <button
          onClick={() => handleSortChange('model')}
          className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
            searchParams.get('sortField') === 'model'
              ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          Model
          <span className="ml-1.5">{getSortIcon('model')}</span>
        </button>
      </div>
    </div>
  );
};

export default ResultsSort; 