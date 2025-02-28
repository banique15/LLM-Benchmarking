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
  private static openRouterConnector: OpenRouterConnector | undefined;

  /**
   * Initialize all available connectors
   */
  static initializeConnectors() {
    // Initialize OpenRouter connector
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (openRouterApiKey) {
      LLMConnectorFactory.openRouterConnector = new OpenRouterConnector(openRouterApiKey);
      LLMConnectorFactory.connectors.set('openrouter', LLMConnectorFactory.openRouterConnector);
    }

    // More connectors can be added here in the future
  }

  /**
   * Get a connector by name
   * @param name The name of the connector
   * @returns The connector instance or undefined if not found
   */
  static getConnector(name: string): LLMConnector | undefined {
    // Map all providers to OpenRouter
    if (LLMConnectorFactory.openRouterConnector) {
      return LLMConnectorFactory.openRouterConnector;
    }
    return undefined;
  }

  /**
   * Get the OpenRouter connector
   * @returns The OpenRouter connector instance
   */
  static getOpenRouterConnector(): OpenRouterConnector | undefined {
    return LLMConnectorFactory.openRouterConnector;
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