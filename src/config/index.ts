import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Application configuration.
 *
 * Both `etsy` and `printful` are now optional – you only need to configure
 * the channels / providers you actually use.  The `website` channel works
 * out of the box with zero external credentials.
 */
export interface Config {
  /** Etsy sales channel (optional – only needed when publishing to Etsy). */
  etsy?: {
    apiKey: string;
    token: string;
    shopId: string;
  };
  /** Printful print provider (optional – only needed for Printful fulfilment). */
  printful?: {
    apiKey: string;
  };
  /** Website sales channel (optional – defaults to ./products output dir). */
  website?: {
    outputDir: string;
  };
}

/**
 * Reads environment variables and returns the application config.
 * Missing values are simply omitted so callers can check what's available.
 */
export function getConfig(): Config {
  const config: Config = {};

  // Etsy – only populate when at least the API key is set
  if (process.env.ETSY_API_KEY) {
    config.etsy = {
      apiKey: process.env.ETSY_API_KEY,
      token: process.env.ETSY_TOKEN || '',
      shopId: process.env.ETSY_SHOP_ID || '',
    };
  }

  // Printful – only populate when the API key is set
  if (process.env.PRINTFUL_API_KEY) {
    config.printful = {
      apiKey: process.env.PRINTFUL_API_KEY,
    };
  }

  // Website channel
  config.website = {
    outputDir: process.env.WEBSITE_OUTPUT_DIR || './products',
  };

  return config;
}

/**
 * Validates that a specific sales channel has all required config.
 *
 * @param config  - The full application config.
 * @param channel - Which channel to validate ('etsy' | 'website').
 * @throws {Error} if required fields are missing.
 */
export function validateChannelConfig(
  config: Config,
  channel: string,
): void {
  if (channel === 'etsy') {
    const missingFields: string[] = [];
    if (!config.etsy?.apiKey) missingFields.push('ETSY_API_KEY');
    if (!config.etsy?.token) missingFields.push('ETSY_TOKEN');
    if (!config.etsy?.shopId) missingFields.push('ETSY_SHOP_ID');

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required Etsy configuration: ${missingFields.join(', ')}\n` +
          'Please set these in your .env file',
      );
    }
  }
  // The website channel requires no external credentials.
}

/**
 * @deprecated Use validateChannelConfig(config, 'etsy') instead.
 */
export function validateConfig(config: Config): void {
  validateChannelConfig(config, 'etsy');
}
