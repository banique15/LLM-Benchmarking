import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface OpenRouterModel {
  id: string;
  name?: string;
  context_length?: number;
  provider?: string;
  description?: string;
}

const ModelRegistration = () => {
  const [openRouterModels, setOpenRouterModels] = useState<OpenRouterModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // List of highlighted models (the ones you specifically wanted to add)
  const highlightedModels = [
    'anthropic/claude-3.7-sonnet',
    'anthropic/claude-3.7-sonnet:thinking',
    'anthropic/claude-3.5-sonnet',
    'google/gemini-2.0-flash-001',
    'deepseek/deepseek-r1',
    'deepseek/deepseek-chat'
  ];

  useEffect(() => {
    const fetchOpenRouterModels = async () => {
      try {
        setLoading(true);
        const response = await axios.get<OpenRouterModel[]>(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/models/openrouter`
        );
        
        // Sort models - put highlighted models first, then alphabetically
        const sortedModels = [...response.data].sort((a, b) => {
          const aIsHighlighted = highlightedModels.includes(a.id);
          const bIsHighlighted = highlightedModels.includes(b.id);
          
          if (aIsHighlighted && !bIsHighlighted) return -1;
          if (!aIsHighlighted && bIsHighlighted) return 1;
          
          // If both are highlighted or both are not, sort alphabetically by name or id
          return (a.name || a.id).localeCompare(b.name || b.id);
        });
        
        setOpenRouterModels(sortedModels);
        setError(null);
      } catch (err) {
        console.error('Error fetching OpenRouter models:', err);
        setError('Failed to load models from OpenRouter. Please check your API key.');
      } finally {
        setLoading(false);
      }
    };

    fetchOpenRouterModels();
  }, []);

  const filteredModels = openRouterModels.filter(model => 
    (model.name || model.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (model.provider || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedModel) {
      setError('Please select a model to register');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      // Get the selected model's details
      const modelDetails = openRouterModels.find(model => model.id === selectedModel);
      const [provider, name] = selectedModel.split('/');
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/models`,
        {
          provider: provider || modelDetails?.provider || 'unknown',
          name: name || modelDetails?.name || selectedModel,
          version: 'latest', // Default version
          description: description || modelDetails?.description || '',
          context_length: modelDetails?.context_length || 4096
        }
      );

      setSuccess(`Model "${name || selectedModel}" registered successfully!`);
      setSelectedModel('');
      setDescription('');
    } catch (err: any) {
      console.error('Error registering model:', err);
      
      // Handle case where model already exists
      if (err.response?.status === 409) {
        setSuccess('This model is already registered in the system.');
      } else {
        setError('Failed to register model. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Function to determine if a model should be highlighted
  const isHighlightedModel = (modelId: string) => {
    return highlightedModels.includes(modelId);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transition-all duration-300 hover:shadow-2xl border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Register OpenRouter Model</h2>
      
      {loading && (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 dark:border-blue-400"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded shadow-md mb-6 animate-fadeIn">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 dark:bg-green-900 border-l-4 border-green-500 text-green-700 dark:text-green-200 p-4 rounded shadow-md mb-6 animate-fadeIn">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500 dark:text-green-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      {!loading && openRouterModels.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">No Models Available</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No models available from OpenRouter. Please check your API key configuration.
          </p>
        </div>
      )}
      
      {openRouterModels.length > 0 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-inner border border-gray-200 dark:border-gray-600">
            <div className="mb-4">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search Models
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  id="search"
                  placeholder="Filter models..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 pr-12 py-2 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-600 dark:text-white"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Model
              </label>
              <select
                id="model"
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  // Auto-fill description if a model is selected
                  const selectedModelDetails = openRouterModels.find(model => model.id === e.target.value);
                  if (selectedModelDetails?.description) {
                    setDescription(selectedModelDetails.description);
                  }
                }}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-600 dark:text-white"
                required
              >
                <option value="">-- Select a model --</option>
                {filteredModels.map((model) => {
                  const isHighlighted = isHighlightedModel(model.id);
                  const displayName = model.name || model.id;
                  const providerInfo = model.provider ? ` (${model.provider})` : '';
                  const contextInfo = model.context_length ? ` - ${model.context_length.toLocaleString()} tokens` : '';
                  
                  return (
                    <option 
                      key={model.id} 
                      value={model.id}
                      className={isHighlighted ? 'font-bold bg-yellow-100 dark:bg-yellow-900' : ''}
                    >
                      {isHighlighted ? '★ ' : ''}{displayName}{providerInfo}{contextInfo}
                    </option>
                  );
                })}
              </select>
              {filteredModels.length === 0 && searchTerm && (
                <p className="mt-2 text-sm text-orange-600 dark:text-orange-400">
                  No models match your search. Try a different term.
                </p>
              )}
              
              {selectedModel && (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {openRouterModels.find(model => model.id === selectedModel)?.context_length && (
                    <p>Context window: {openRouterModels.find(model => model.id === selectedModel)?.context_length?.toLocaleString()} tokens</p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Enter a description for this model..."
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 ease-in-out focus:shadow-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={submitting || !selectedModel}
              className={`w-full inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white transition-all duration-200
                ${submitting || !selectedModel 
                  ? 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 hover:shadow-md'}`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </>
              ) : (
                <>Register Model</>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ModelRegistration; 