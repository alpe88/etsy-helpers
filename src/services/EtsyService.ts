import axios, { AxiosInstance } from 'axios';
import { Product, EtsyProduct, ProductOperationResult } from '../models/Product';
import { Config } from '../config';
import { SalesChannel } from './SalesChannel';

/**
 * Etsy API Service
 *
 * Implements the SalesChannel interface so it can be used interchangeably
 * with any other storefront (website, Shopify, etc.).
 */
export class EtsyService implements SalesChannel {
  readonly name = 'Etsy';

  private client: AxiosInstance;
  private config: Config;

  constructor(config: Config) {
    this.config = config;

    this.client = axios.create({
      baseURL: 'https://openapi.etsy.com/v3',
      headers: {
        'x-api-key': config.etsy?.apiKey ?? '',
        'Authorization': `Bearer ${config.etsy?.token ?? ''}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // -----------------------------------------------------------------------
  // SalesChannel implementation
  // -----------------------------------------------------------------------

  async createListing(product: Product): Promise<ProductOperationResult> {
    const etsyProduct = this.toEtsyPayload(product);
    try {
      const response = await this.client.post(
        `/application/shops/${this.config.etsy?.shopId}/listings`,
        etsyProduct,
      );

      return {
        success: true,
        listingId: response.data.listing_id?.toString(),
        message: 'Product listing created successfully on Etsy',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateListing(
    listingId: string,
    product: Partial<Product>,
  ): Promise<ProductOperationResult> {
    try {
      const response = await this.client.patch(
        `/application/shops/${this.config.etsy?.shopId}/listings/${listingId}`,
        product,
      );

      return {
        success: true,
        listingId: response.data.listing_id?.toString(),
        message: 'Product listing updated successfully on Etsy',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async uploadImages(
    listingId: string,
    imageUrls: string[],
  ): Promise<ProductOperationResult> {
    try {
      const results = await Promise.all(
        imageUrls.map((url, index) =>
          this.client.post(
            `/application/shops/${this.config.etsy?.shopId}/listings/${listingId}/images`,
            { image_url: url, rank: index + 1 },
          ),
        ),
      );

      return {
        success: true,
        listingId,
        message: `${results.length} image(s) uploaded successfully`,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  isConfigured(): boolean {
    return !!(
      this.config.etsy?.apiKey &&
      this.config.etsy?.token &&
      this.config.etsy?.shopId
    );
  }

  // -----------------------------------------------------------------------
  // Etsy-specific helpers
  // -----------------------------------------------------------------------

  /**
   * Maps a platform-agnostic Product to the Etsy API payload.
   */
  private toEtsyPayload(product: Product): Record<string, unknown> {
    const etsy = product as EtsyProduct;
    return {
      quantity: product.quantity,
      title: product.title,
      description: product.description,
      price: product.price,
      who_made: 'i_did',
      when_made: '2020_2024',
      taxonomy_id: etsy.taxonomyId ?? 1,
      shipping_profile_id: etsy.shippingProfileId,
      tags: product.tags,
      materials: product.materials,
      production_partner_ids: etsy.productionPartnerIds,
    };
  }

  private handleError(error: unknown): ProductOperationResult {
    if (axios.isAxiosError(error)) {
      const errors: string[] = [];

      if (error.response) {
        const data = error.response.data;
        errors.push(
          `API Error: ${error.response.status} - ${error.response.statusText}`,
        );
        if (data?.error) errors.push(data.error);
        if (data?.errors) errors.push(...data.errors);
      } else if (error.request) {
        errors.push('No response from Etsy API. Please check your connection.');
      } else {
        errors.push(`Request error: ${error.message}`);
      }

      return { success: false, message: 'Failed to process request', errors };
    }

    return {
      success: false,
      message: 'An unexpected error occurred',
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}
