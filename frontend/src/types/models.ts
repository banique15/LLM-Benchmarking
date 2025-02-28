export interface Model {
  id: string;
  name: string;
  provider: string;
  version?: string;
  context_length?: number;
  description?: string;
}

export interface OpenRouterModel {
  id: string;
  name?: string;
  provider?: string;
  context_length?: number;
  description?: string;
  pricing?: {
    prompt: number;
    completion: number;
  };
} 