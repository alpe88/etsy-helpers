import { Product, ProductOperationResult } from '../models/Product';

/**
 * SalesChannel – abstraction over any storefront where products are listed.
 *
 * Implement this interface for each sales channel (Etsy, own website, Shopify, etc.)
 * to keep the core product pipeline channel-agnostic.
 */
export interface SalesChannel {
  /** Human-readable name of the channel (e.g. "Etsy", "Website"). */
  readonly name: string;

  /**
   * Publish a product to this sales channel.
   * @returns Result indicating success / failure plus a channel-specific listing ID.
   */
  createListing(product: Product): Promise<ProductOperationResult>;

  /**
   * Update an existing listing on this channel.
   */
  updateListing(
    listingId: string,
    product: Partial<Product>,
  ): Promise<ProductOperationResult>;

  /**
   * Upload / attach images to an existing listing.
   */
  uploadImages(
    listingId: string,
    imageUrls: string[],
  ): Promise<ProductOperationResult>;

  /**
   * Returns true when the channel has all required configuration present.
   */
  isConfigured(): boolean;
}
