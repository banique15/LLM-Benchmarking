export interface LLMRequestOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  [key: string]: any;
}

export interface LLMResponse {
  text: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  latency_ms: number;
  model_info: {
    name: string;
    provider: string;
    version: string;
  };
  raw_response?: any;
}

// Generic model information interface
export interface ModelInfo {
  id: string;
  name?: string;
  context_length?: number;
  provider?: string;
  description?: string;
  [key: string]: any;
}

export interface LLMConnector {
  /**
   * Get the name of the LLM provider
   */
  getProviderName(): string;
  
  /**
   * Get available models from this provider
   * Can return either simple model ID strings or detailed model info objects
   */
  getAvailableModels(): Promise<string[] | ModelInfo[]>;
  
  /**
   * Send a prompt to the LLM and get a response
   * @param prompt The text prompt to send to the LLM
   * @param options Additional options for the request
   */
  generateText(prompt: string, options?: LLMRequestOptions): Promise<LLMResponse>;
  
  /**
   * Check if the connector is properly configured
   */
  isConfigured(): boolean;
} 