import axios, { AxiosInstance } from 'axios';
import { PrintfulProduct } from '../models/Product';
import { Config } from '../config';

/**
 * Printful API Service
 * Follows Single Responsibility Principle - handles only Printful API interactions
 */
export class PrintfulService {
  private client: AxiosInstance;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
    
    if (!config.printful.apiKey) {
      throw new Error('Printful API key is required for Printful integration');
    }

    this.client = axios.create({
      baseURL: 'https://api.printful.com',
      headers: {
        'Authorization': `Bearer ${config.printful.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Retrieves sync variants from Printful
   * These are products that have been synced to your store
   * @returns Array of Printful products
   */
  async getSyncVariants(): Promise<PrintfulProduct[]> {
    try {
      const response = await this.client.get('/store/products');
      
      return response.data.result.map((item: any) => ({
        syncVariantId: item.id,
        name: item.name,
        price: item.retail_price,
        image: item.thumbnail_url,
      }));
    } catch (error) {
      console.error('Error fetching Printful products:', error);
      return [];
    }
  }

  /**
   * Gets product information from Printful
   * @param syncVariantId - Printful sync variant ID
   * @returns Product information or null if not found
   */
  async getProductInfo(syncVariantId: number): Promise<PrintfulProduct | null> {
    try {
      const response = await this.client.get(`/store/products/${syncVariantId}`);
      const data = response.data.result;

      return {
        syncVariantId: data.id,
        name: data.name,
        price: data.retail_price,
        image: data.thumbnail_url,
      };
    } catch (error) {
      console.error(`Error fetching Printful product ${syncVariantId}:`, error);
      return null;
    }
  }

  /**
   * Validates if the service is properly configured
   * @returns true if configured, false otherwise
   */
  isConfigured(): boolean {
    return !!this.config.printful.apiKey;
  }
}
