import axios, { AxiosInstance } from 'axios';
import { EtsyProduct, ProductCreationResult } from '../models/Product';
import { Config } from '../config';

/**
 * Etsy API Service
 * Follows Single Responsibility Principle - handles only Etsy API interactions
 * Follows Dependency Inversion Principle - depends on abstractions (Config interface)
 */
export class EtsyService {
  private client: AxiosInstance;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.client = axios.create({
      baseURL: 'https://openapi.etsy.com/v3',
      headers: {
        'x-api-key': config.etsy.apiKey,
        'Authorization': `Bearer ${config.etsy.token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Creates a new product listing on Etsy
   * @param product - Product data to create
   * @returns Result of the creation operation
   */
  async createListing(product: EtsyProduct): Promise<ProductCreationResult> {
    try {
      const response = await this.client.post(
        `/application/shops/${this.config.etsy.shopId}/listings`,
        {
          quantity: product.quantity,
          title: product.title,
          description: product.description,
          price: product.price,
          who_made: 'i_did', // Default value, can be made configurable
          when_made: '2020_2024', // Default value, can be made configurable
          taxonomy_id: product.taxonomyId || 1, // Default to a valid taxonomy ID
          shipping_profile_id: product.shippingProfileId,
          tags: product.tags,
          materials: product.materials,
          production_partner_ids: product.productionPartnerIds,
        }
      );

      return {
        success: true,
        listingId: response.data.listing_id?.toString(),
        message: 'Product listing created successfully',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Updates an existing product listing
   * @param listingId - ID of the listing to update
   * @param product - Updated product data
   * @returns Result of the update operation
   */
  async updateListing(
    listingId: string,
    product: Partial<EtsyProduct>
  ): Promise<ProductCreationResult> {
    try {
      const response = await this.client.patch(
        `/application/shops/${this.config.etsy.shopId}/listings/${listingId}`,
        product
      );

      return {
        success: true,
        listingId: response.data.listing_id?.toString(),
        message: 'Product listing updated successfully',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Uploads images for a listing
   * @param listingId - ID of the listing
   * @param imageUrls - Array of image URLs to upload
   * @returns Result of the upload operation
   */
  async uploadImages(
    listingId: string,
    imageUrls: string[]
  ): Promise<ProductCreationResult> {
    try {
      const results = await Promise.all(
        imageUrls.map((url, index) =>
          this.client.post(
            `/application/shops/${this.config.etsy.shopId}/listings/${listingId}/images`,
            { image_url: url, rank: index + 1 }
          )
        )
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

  /**
   * Handles API errors and returns a standardized result
   * @param error - Error from API call
   * @returns ProductCreationResult with error information
   */
  private handleError(error: any): ProductCreationResult {
    if (axios.isAxiosError(error)) {
      const errors: string[] = [];
      
      if (error.response) {
        // Server responded with error
        const data = error.response.data;
        errors.push(`API Error: ${error.response.status} - ${error.response.statusText}`);
        
        if (data?.error) {
          errors.push(data.error);
        }
        
        if (data?.errors) {
          errors.push(...data.errors);
        }
      } else if (error.request) {
        // Request made but no response
        errors.push('No response from Etsy API. Please check your connection.');
      } else {
        // Error setting up request
        errors.push(`Request error: ${error.message}`);
      }

      return {
        success: false,
        message: 'Failed to process request',
        errors,
      };
    }

    return {
      success: false,
      message: 'An unexpected error occurred',
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}
