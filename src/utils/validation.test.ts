import { validateProductInput, convertToEtsyProduct, formatPrice, parsePrice } from './validation';
import { ProductInput } from '../models/Product';

/**
 * Validation Utilities Tests
 * Following Clean Code principles - test one concept per test
 */

describe('validateProductInput', () => {
  describe('title validation', () => {
    it('should pass with valid title', () => {
      const input: ProductInput = {
        title: 'Valid Product Title',
        description: 'Valid description',
        price: 10,
        quantity: 5,
      };
      const errors = validateProductInput(input);
      expect(errors).toHaveLength(0);
    });

    it('should fail when title is empty', () => {
      const input: ProductInput = {
        title: '',
        description: 'Valid description',
        price: 10,
        quantity: 5,
      };
      const errors = validateProductInput(input);
      expect(errors).toContain('Title is required');
    });

    it('should fail when title is only whitespace', () => {
      const input: ProductInput = {
        title: '   ',
        description: 'Valid description',
        price: 10,
        quantity: 5,
      };
      const errors = validateProductInput(input);
      expect(errors).toContain('Title is required');
    });

    it('should fail when title exceeds 140 characters', () => {
      const input: ProductInput = {
        title: 'A'.repeat(141),
        description: 'Valid description',
        price: 10,
        quantity: 5,
      };
      const errors = validateProductInput(input);
      expect(errors).toContain('Title must be 140 characters or less');
    });

    it('should pass with title of exactly 140 characters', () => {
      const input: ProductInput = {
        title: 'A'.repeat(140),
        description: 'Valid description',
        price: 10,
        quantity: 5,
      };
      const errors = validateProductInput(input);
      expect(errors).not.toContain('Title must be 140 characters or less');
    });
  });

  describe('description validation', () => {
    it('should fail when description is empty', () => {
      const input: ProductInput = {
        title: 'Valid Title',
        description: '',
        price: 10,
        quantity: 5,
      };
      const errors = validateProductInput(input);
      expect(errors).toContain('Description is required');
    });

    it('should fail when description is only whitespace', () => {
      const input: ProductInput = {
        title: 'Valid Title',
        description: '   ',
        price: 10,
        quantity: 5,
      };
      const errors = validateProductInput(input);
      expect(errors).toContain('Description is required');
    });
  });

  describe('price validation', () => {
    it('should fail when price is zero', () => {
      const input: ProductInput = {
        title: 'Valid Title',
        description: 'Valid description',
        price: 0,
        quantity: 5,
      };
      const errors = validateProductInput(input);
      expect(errors).toContain('Price must be greater than 0');
    });

    it('should fail when price is negative', () => {
      const input: ProductInput = {
        title: 'Valid Title',
        description: 'Valid description',
        price: -10,
        quantity: 5,
      };
      const errors = validateProductInput(input);
      expect(errors).toContain('Price must be greater than 0');
    });

    it('should pass with positive price', () => {
      const input: ProductInput = {
        title: 'Valid Title',
        description: 'Valid description',
        price: 0.01,
        quantity: 5,
      };
      const errors = validateProductInput(input);
      expect(errors).not.toContain('Price must be greater than 0');
    });
  });

  describe('quantity validation', () => {
    it('should fail when quantity is negative', () => {
      const input: ProductInput = {
        title: 'Valid Title',
        description: 'Valid description',
        price: 10,
        quantity: -1,
      };
      const errors = validateProductInput(input);
      expect(errors).toContain('Quantity must be 0 or greater');
    });

    it('should pass when quantity is zero', () => {
      const input: ProductInput = {
        title: 'Valid Title',
        description: 'Valid description',
        price: 10,
        quantity: 0,
      };
      const errors = validateProductInput(input);
      expect(errors).not.toContain('Quantity must be 0 or greater');
    });

    it('should pass with positive quantity', () => {
      const input: ProductInput = {
        title: 'Valid Title',
        description: 'Valid description',
        price: 10,
        quantity: 100,
      };
      const errors = validateProductInput(input);
      expect(errors).not.toContain('Quantity must be 0 or greater');
    });
  });

  describe('tags validation', () => {
    it('should pass with 13 tags or less', () => {
      const input: ProductInput = {
        title: 'Valid Title',
        description: 'Valid description',
        price: 10,
        quantity: 5,
        tags: Array(13).fill('tag'),
      };
      const errors = validateProductInput(input);
      expect(errors).not.toContain('Maximum 13 tags allowed');
    });

    it('should fail with more than 13 tags', () => {
      const input: ProductInput = {
        title: 'Valid Title',
        description: 'Valid description',
        price: 10,
        quantity: 5,
        tags: Array(14).fill('tag'),
      };
      const errors = validateProductInput(input);
      expect(errors).toContain('Maximum 13 tags allowed');
    });

    it('should fail when any tag exceeds 20 characters', () => {
      const input: ProductInput = {
        title: 'Valid Title',
        description: 'Valid description',
        price: 10,
        quantity: 5,
        tags: ['valid', 'A'.repeat(21)],
      };
      const errors = validateProductInput(input);
      expect(errors).toContain('Tag 2 exceeds 20 characters');
    });

    it('should pass with tags of 20 characters', () => {
      const input: ProductInput = {
        title: 'Valid Title',
        description: 'Valid description',
        price: 10,
        quantity: 5,
        tags: ['A'.repeat(20)],
      };
      const errors = validateProductInput(input);
      expect(errors.filter((e: string) => e.includes('exceeds 20 characters'))).toHaveLength(0);
    });
  });

  describe('multiple validation errors', () => {
    it('should return all validation errors', () => {
      const input: ProductInput = {
        title: '',
        description: '',
        price: -1,
        quantity: -1,
        tags: Array(14).fill('tag'),
      };
      const errors = validateProductInput(input);
      expect(errors.length).toBeGreaterThan(1);
      expect(errors).toContain('Title is required');
      expect(errors).toContain('Description is required');
      expect(errors).toContain('Price must be greater than 0');
      expect(errors).toContain('Quantity must be 0 or greater');
      expect(errors).toContain('Maximum 13 tags allowed');
    });
  });
});

describe('convertToEtsyProduct', () => {
  it('should convert ProductInput to EtsyProduct', () => {
    const input: ProductInput = {
      title: 'Test Product',
      description: 'Test Description',
      price: 19.99,
      quantity: 10,
      tags: ['tag1', 'tag2'],
      materials: ['material1'],
    };
    
    const result = convertToEtsyProduct(input);
    
    expect(result.title).toBe('Test Product');
    expect(result.description).toBe('Test Description');
    expect(result.price).toBe(19.99);
    expect(result.quantity).toBe(10);
    expect(result.tags).toEqual(['tag1', 'tag2']);
    expect(result.materials).toEqual(['material1']);
  });

  it('should trim whitespace from title and description', () => {
    const input: ProductInput = {
      title: '  Test Product  ',
      description: '  Test Description  ',
      price: 19.99,
      quantity: 10,
    };
    
    const result = convertToEtsyProduct(input);
    
    expect(result.title).toBe('Test Product');
    expect(result.description).toBe('Test Description');
  });

  it('should trim whitespace from tags and materials', () => {
    const input: ProductInput = {
      title: 'Test',
      description: 'Test',
      price: 10,
      quantity: 5,
      tags: ['  tag1  ', '  tag2  '],
      materials: ['  material1  ', '  material2  '],
    };
    
    const result = convertToEtsyProduct(input);
    
    expect(result.tags).toEqual(['tag1', 'tag2']);
    expect(result.materials).toEqual(['material1', 'material2']);
  });

  it('should handle undefined optional fields', () => {
    const input: ProductInput = {
      title: 'Test',
      description: 'Test',
      price: 10,
      quantity: 5,
    };
    
    const result = convertToEtsyProduct(input);
    
    expect(result.tags).toBeUndefined();
    expect(result.materials).toBeUndefined();
  });
});

describe('formatPrice', () => {
  it('should format price with 2 decimal places', () => {
    expect(formatPrice(10)).toBe('$10.00');
    expect(formatPrice(10.5)).toBe('$10.50');
    expect(formatPrice(10.99)).toBe('$10.99');
  });

  it('should round to 2 decimal places', () => {
    expect(formatPrice(10.999)).toBe('$11.00');
    expect(formatPrice(10.994)).toBe('$10.99');
  });
});

describe('parsePrice', () => {
  it('should parse price string with dollar sign', () => {
    expect(parsePrice('$10.99')).toBe(10.99);
  });

  it('should parse price string without dollar sign', () => {
    expect(parsePrice('10.99')).toBe(10.99);
  });

  it('should handle various currency formats', () => {
    expect(parsePrice('$1,000.99')).toBe(1000.99);
    expect(parsePrice('USD 10.99')).toBe(10.99);
  });
});
