/**
 * Product models following Interface Segregation Principle
 * Each interface represents a specific contract
 */

/**
 * Core product information required for Etsy listing
 */
export interface EtsyProduct {
  title: string;
  description: string;
  price: number;
  quantity: number;
  taxonomyId?: number;
  tags?: string[];
  materials?: string[];
  shippingProfileId?: number;
  productionPartnerIds?: number[];
  images?: ProductImage[];
  variations?: ProductVariation[];
}

/**
 * Product image information
 */
export interface ProductImage {
  url: string;
  rank: number;
  altText?: string;
}

/**
 * Product variation (e.g., size, color)
 */
export interface ProductVariation {
  propertyId: number;
  valueIds: number[];
  scalingPriceAdjustments?: number[];
  quantityAdjustments?: number[];
}

/**
 * Printful product information
 */
export interface PrintfulProduct {
  syncVariantId?: number;
  name: string;
  size?: string;
  color?: string;
  price: number;
  image?: string;
}

/**
 * Generic product input that can be adapted to different platforms
 */
export interface ProductInput {
  title: string;
  description: string;
  price: number;
  quantity: number;
  tags?: string[];
  materials?: string[];
  images?: string[];
  variants?: {
    size?: string;
    color?: string;
    price?: number;
    quantity?: number;
  }[];
}

/**
 * Result of product creation
 */
export interface ProductCreationResult {
  success: boolean;
  listingId?: string;
  message: string;
  errors?: string[];
}
