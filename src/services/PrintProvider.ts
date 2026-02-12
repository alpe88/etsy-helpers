import { PrintfulProduct } from '../models/Product';

/**
 * PrintProvider – abstraction over any print-on-demand fulfilment service.
 *
 * Implement this interface for each provider (Printful, Printify, Gooten, etc.)
 * to keep print fulfilment independent of the sales channel.
 */
export interface PrintProvider {
  /** Human-readable name of the provider (e.g. "Printful"). */
  readonly name: string;

  /**
   * List products / sync-variants available in the store.
   */
  getProducts(): Promise<PrintfulProduct[]>;

  /**
   * Get details for a single product / sync-variant.
   */
  getProductInfo(id: number): Promise<PrintfulProduct | null>;

  /**
   * Returns true when the provider has all required configuration present.
   */
  isConfigured(): boolean;
}
