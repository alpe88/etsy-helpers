import { validateConfig, Config } from './index';

/**
 * Configuration Tests
 * Following Clean Code principles
 */

describe('validateConfig', () => {
  it('should pass with valid configuration', () => {
    const config: Config = {
      etsy: {
        apiKey: 'test-key',
        token: 'test-token',
        shopId: '123456',
      },
      printful: {},
    };

    expect(() => validateConfig(config)).not.toThrow();
  });

  it('should throw when API key is missing', () => {
    const config: Config = {
      etsy: {
        apiKey: '',
        token: 'test-token',
        shopId: '123456',
      },
      printful: {},
    };

    expect(() => validateConfig(config)).toThrow('ETSY_API_KEY');
  });

  it('should throw when token is missing', () => {
    const config: Config = {
      etsy: {
        apiKey: 'test-key',
        token: '',
        shopId: '123456',
      },
      printful: {},
    };

    expect(() => validateConfig(config)).toThrow('ETSY_TOKEN');
  });

  it('should throw when shop ID is missing', () => {
    const config: Config = {
      etsy: {
        apiKey: 'test-key',
        token: 'test-token',
        shopId: '',
      },
      printful: {},
    };

    expect(() => validateConfig(config)).toThrow('ETSY_SHOP_ID');
  });

  it('should throw with all missing fields listed', () => {
    const config: Config = {
      etsy: {
        apiKey: '',
        token: '',
        shopId: '',
      },
      printful: {},
    };

    expect(() => validateConfig(config)).toThrow(/ETSY_API_KEY.*ETSY_TOKEN.*ETSY_SHOP_ID/);
  });

  it('should not require printful API key', () => {
    const config: Config = {
      etsy: {
        apiKey: 'test-key',
        token: 'test-token',
        shopId: '123456',
      },
      printful: {},
    };

    expect(() => validateConfig(config)).not.toThrow();
  });
});
