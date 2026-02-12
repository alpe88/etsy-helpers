/**
 * Platform-agnostic product models.
 *
 * These models represent the core product data independently of any
 * sales channel (Etsy, website, etc.) or print provider (Printful, etc.).
 */

// ---------------------------------------------------------------------------
// Core product types (channel-independent)
// ---------------------------------------------------------------------------

/**
 * Core product information, independent of any sales channel or provider.
 */
export interface Product {
  title: string;
  description: string;
  price: number;
  quantity: number;
  tags?: string[];
  materials?: string[];
  images?: ProductImage[];
  variations?: ProductVariation[];
}

/**
 * Product image information.
 */
export interface ProductImage {
  url: string;
  rank: number;
  altText?: string;
}

/**
 * Product variation (e.g., size, color).
 */
export interface ProductVariation {
  propertyId: number;
  valueIds: number[];
  scalingPriceAdjustments?: number[];
  quantityAdjustments?: number[];
}

/**
 * Input collected from the CLI before validation.
 * Image URLs arrive as plain strings and get converted to ProductImage later.
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
 * Standardised result returned by any sales channel or print provider
 * after a create / update / publish operation.
 */
export interface ProductOperationResult {
  success: boolean;
  /** Channel-specific listing / product ID */
  listingId?: string;
  message: string;
  errors?: string[];
}

// ---------------------------------------------------------------------------
// Etsy-specific types (kept for backwards-compat with EtsyService)
// ---------------------------------------------------------------------------

/**
 * Etsy-specific product fields that extend the core Product.
 */
export interface EtsyProduct extends Product {
  taxonomyId?: number;
  shippingProfileId?: number;
  productionPartnerIds?: number[];
}

// ---------------------------------------------------------------------------
// Printful-specific types
// ---------------------------------------------------------------------------

/**
 * Printful product / sync-variant representation.
 */
export interface PrintfulProduct {
  syncVariantId?: number;
  name: string;
  size?: string;
  color?: string;
  price: number;
  image?: string;
}

// ---------------------------------------------------------------------------
// Legacy aliases (so nothing breaks during migration)
// ---------------------------------------------------------------------------

/** @deprecated Use ProductOperationResult instead. */
export type ProductCreationResult = ProductOperationResult;
