import { LLMConnector } from './LLMConnector';
import { OpenRouterConnector } from './OpenRouterConnector';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Factory class for creating and managing LLM connectors
 */
export class LLMConnectorFactory {
  private static connectors: Map<string, LLMConnector> = new Map();

  /**
   * Initialize all available connectors
   */
  static initializeConnectors() {
    // Initialize OpenRouter connector
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (openRouterApiKey) {
      const openRouterConnector = new OpenRouterConnector(openRouterApiKey);
      LLMConnectorFactory.connectors.set('openrouter', openRouterConnector);
    }

    // More connectors can be added here in the future
  }

  /**
   * Get a connector by name
   * @param name The name of the connector
   * @returns The connector instance or undefined if not found
   */
  static getConnector(name: string): LLMConnector | undefined {
    return LLMConnectorFactory.connectors.get(name.toLowerCase());
  }

  /**
   * Get the OpenRouter connector
   * @returns The OpenRouter connector instance
   */
  static getOpenRouterConnector(): OpenRouterConnector | undefined {
    return LLMConnectorFactory.connectors.get('openrouter') as OpenRouterConnector;
  }

  /**
   * Get all available connectors
   * @returns Array of connector instances
   */
  static getAllConnectors(): LLMConnector[] {
    return Array.from(LLMConnectorFactory.connectors.values());
  }

  /**
   * Get a list of all available connector names
   * @returns Array of connector names
   */
  static getAvailableConnectorNames(): string[] {
    return Array.from(LLMConnectorFactory.connectors.keys());
  }
}

// Initialize connectors when the module is imported
LLMConnectorFactory.initializeConnectors(); 