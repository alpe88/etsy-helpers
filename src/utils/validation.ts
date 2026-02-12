import { ProductInput, EtsyProduct } from '../models/Product';

/**
 * Validation utilities following Single Responsibility Principle
 */

/**
 * Validates product input data
 * @param input - Product input to validate
 * @returns Array of validation errors, empty if valid
 */
export function validateProductInput(input: ProductInput): string[] {
  const errors: string[] = [];

  if (!input.title || input.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (input.title.length > 140) {
    errors.push('Title must be 140 characters or less');
  }

  if (!input.description || input.description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (input.price === undefined || input.price === null) {
    errors.push('Price is required');
  } else if (input.price <= 0) {
    errors.push('Price must be greater than 0');
  }

  if (input.quantity === undefined || input.quantity === null) {
    errors.push('Quantity is required');
  } else if (input.quantity < 0) {
    errors.push('Quantity must be 0 or greater');
  }

  if (input.tags && input.tags.length > 13) {
    errors.push('Maximum 13 tags allowed');
  }

  if (input.tags) {
    input.tags.forEach((tag, index) => {
      if (tag.length > 20) {
        errors.push(`Tag ${index + 1} exceeds 20 characters`);
      }
    });
  }

  return errors;
}

/**
 * Converts generic ProductInput to Etsy-specific format
 * @param input - Generic product input
 * @returns Etsy-formatted product
 */
export function convertToEtsyProduct(input: ProductInput): EtsyProduct {
  return {
    title: input.title.trim(),
    description: input.description.trim(),
    price: input.price,
    quantity: input.quantity,
    tags: input.tags?.map(tag => tag.trim()),
    materials: input.materials?.map(m => m.trim()),
  };
}

/**
 * Formats price for display
 * @param price - Price in decimal format
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/**
 * Parses a price string to number
 * @param priceString - Price string (e.g., "$10.99" or "10.99")
 * @returns Parsed price as number
 */
export function parsePrice(priceString: string): number {
  const cleaned = priceString.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned);
}
