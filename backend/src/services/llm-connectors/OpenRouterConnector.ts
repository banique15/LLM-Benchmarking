import axios from 'axios';
import { LLMConnector, LLMRequestOptions, LLMResponse } from './LLMConnector';

// Enhanced model interface to include more details
export interface OpenRouterModelInfo {
  id: string;
  name?: string;
  context_length?: number;
  provider?: string;
  description?: string;
}

export class OpenRouterConnector implements LLMConnector {
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getProviderName(): string {
    return 'OpenRouter';
  }

  // Updated to return more detailed model information
  async getAvailableModels(): Promise<OpenRouterModelInfo[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && Array.isArray(response.data.data)) {
        // Extract and return more comprehensive model information
        return response.data.data.map((model: any) => {
          const parts = model.id.split('/');
          const provider = parts.length > 1 ? parts[0] : 'unknown';
          const name = parts.length > 1 ? parts[1] : model.id;
          
          return {
            id: model.id,
            name: name,
            provider: provider,
            context_length: model.context_length || 4096,
            description: model.description || `${provider} model: ${name}`
          };
        });
      }

      return [];
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      return [];
    }
  }

  async generateText(prompt: string, options?: LLMRequestOptions): Promise<LLMResponse> {
    const startTime = Date.now();
    
    // Default model if not specified
    const model = options?.model || 'openai/gpt-3.5-turbo';
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: model,
          messages: [{ role: 'user', content: prompt }],
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.max_tokens,
          top_p: options?.top_p ?? 1,
          frequency_penalty: options?.frequency_penalty ?? 0,
          presence_penalty: options?.presence_penalty ?? 0,
          stop: options?.stop,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://llm-benchmarking-platform',
            'X-Title': 'LLM Benchmarking Platform'
          }
        }
      );

      const latency = Date.now() - startTime;

      // Extract provider and model info from the response
      const modelInfo = response.data.model.split('/');
      const provider = modelInfo.length > 1 ? modelInfo[0] : 'unknown';
      const modelName = modelInfo.length > 1 ? modelInfo[1] : modelInfo[0];
      
      return {
        text: response.data.choices[0].message.content,
        usage: response.data.usage,
        latency_ms: latency,
        model_info: {
          name: modelName,
          provider: provider,
          version: model
        },
        raw_response: response.data
      };
    } catch (error) {
      console.error('Error generating text with OpenRouter:', error);
      throw new Error(`OpenRouter API error: ${error}`);
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
} 