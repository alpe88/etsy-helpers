import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config();

/**
 * Application configuration
 * Follows Single Responsibility Principle - handles configuration only
 */
export interface Config {
  etsy: {
    apiKey: string;
    token: string;
    shopId: string;
  };
  printful: {
    apiKey?: string;
  };
}

/**
 * Validates and returns application configuration
 * @throws {Error} if required configuration is missing
 */
export function getConfig(): Config {
  const config: Config = {
    etsy: {
      apiKey: process.env.ETSY_API_KEY || '',
      token: process.env.ETSY_TOKEN || '',
      shopId: process.env.ETSY_SHOP_ID || '',
    },
    printful: {
      apiKey: process.env.PRINTFUL_API_KEY,
    },
  };

  return config;
}

/**
 * Validates that required configuration is present
 * @param config - Configuration to validate
 * @throws {Error} if required fields are missing
 */
export function validateConfig(config: Config): void {
  const missingFields: string[] = [];

  if (!config.etsy.apiKey) missingFields.push('ETSY_API_KEY');
  if (!config.etsy.token) missingFields.push('ETSY_TOKEN');
  if (!config.etsy.shopId) missingFields.push('ETSY_SHOP_ID');

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required configuration: ${missingFields.join(', ')}\n` +
      'Please set these in your .env file'
    );
  }
}
