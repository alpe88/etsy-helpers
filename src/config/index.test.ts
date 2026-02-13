import { validateConfig, validateChannelConfig, Config } from './index';

/**
 * Configuration Tests
 */

describe('validateConfig (legacy)', () => {
  it('should pass with valid Etsy configuration', () => {
    const config: Config = {
      etsy: {
        apiKey: 'test-key',
        token: 'test-token',
        shopId: '123456',
      },
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
    };

    expect(() => validateConfig(config)).not.toThrow();
  });
});

describe('validateChannelConfig', () => {
  it('should pass for etsy channel with full config', () => {
    const config: Config = {
      etsy: {
        apiKey: 'test-key',
        token: 'test-token',
        shopId: '123456',
      },
    };

    expect(() => validateChannelConfig(config, 'etsy')).not.toThrow();
  });

  it('should throw for etsy channel when etsy config is missing', () => {
    const config: Config = {};

    expect(() => validateChannelConfig(config, 'etsy')).toThrow('ETSY_API_KEY');
  });

  it('should pass for website channel with no config', () => {
    const config: Config = {};

    expect(() => validateChannelConfig(config, 'website')).not.toThrow();
  });

  it('should pass for website channel with custom output dir', () => {
    const config: Config = {
      website: { outputDir: './my-products' },
    };

    expect(() => validateChannelConfig(config, 'website')).not.toThrow();
  });
});
