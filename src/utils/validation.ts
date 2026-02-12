import { ProductInput, Product } from '../models/Product';

/**
 * Validation utilities – completely platform-agnostic.
 */

/**
 * Validates product input data (channel-independent).
 * @returns Array of validation errors, empty if valid.
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
 * Converts CLI ProductInput to the platform-agnostic Product model.
 */
export function toProduct(input: ProductInput): Product {
  return {
    title: input.title.trim(),
    description: input.description.trim(),
    price: input.price,
    quantity: input.quantity,
    tags: input.tags?.map((tag) => tag.trim()),
    materials: input.materials?.map((m) => m.trim()),
  };
}

/**
 * @deprecated Use `toProduct` instead.
 */
export const convertToEtsyProduct = toProduct;

/**
 * Formats price for display.
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/**
 * Parses a price string to number.
 */
export function parsePrice(priceString: string): number {
  const cleaned = priceString.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned);
}

/** Known sales channel identifiers. */
export const SUPPORTED_CHANNELS = ['etsy', 'website'] as const;
export type ChannelName = (typeof SUPPORTED_CHANNELS)[number];

/**
 * Validates a channel name string.
 */
export function isValidChannel(name: string): name is ChannelName {
  return (SUPPORTED_CHANNELS as readonly string[]).includes(name);
}
