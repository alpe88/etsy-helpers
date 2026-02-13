import axios, { AxiosInstance } from 'axios';
import { PrintfulProduct } from '../models/Product';
import { Config } from '../config';
import { PrintProvider } from './PrintProvider';

/**
 * Printful API Service
 *
 * Implements the PrintProvider interface so fulfilment logic stays
 * decoupled from whatever sales channel is being used.
 */
export class PrintfulService implements PrintProvider {
  readonly name = 'Printful';

  private client: AxiosInstance;
  private config: Config;

  constructor(config: Config) {
    this.config = config;

    if (!config.printful?.apiKey) {
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

  // -----------------------------------------------------------------------
  // PrintProvider implementation
  // -----------------------------------------------------------------------

  async getProducts(): Promise<PrintfulProduct[]> {
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

  async getProductInfo(syncVariantId: number): Promise<PrintfulProduct | null> {
    try {
      const response = await this.client.get(
        `/store/products/${syncVariantId}`,
      );
      const data = response.data.result;

      return {
        syncVariantId: data.id,
        name: data.name,
        price: data.retail_price,
        image: data.thumbnail_url,
      };
    } catch (error) {
      console.error(
        `Error fetching Printful product ${syncVariantId}:`,
        error,
      );
      return null;
    }
  }

  isConfigured(): boolean {
    return !!this.config.printful?.apiKey;
  }
}
