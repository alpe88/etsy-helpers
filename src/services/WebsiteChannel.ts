import * as fs from 'fs';
import * as path from 'path';
import { Product, ProductOperationResult } from '../models/Product';
import { Config } from '../config';
import { SalesChannel } from './SalesChannel';

/**
 * Website Sales Channel
 *
 * Exports products as JSON files that can be consumed by any website
 * framework (Next.js, Gatsby, plain HTML + JS, etc.) to power a
 * self-hosted print-on-demand storefront.
 *
 * Product data is written to a configurable output directory as individual
 * JSON files (one per product) plus a `products.json` catalogue index.
 */
export class WebsiteChannel implements SalesChannel {
  readonly name = 'Website';

  private outputDir: string;

  constructor(config: Config) {
    this.outputDir = config.website?.outputDir ?? './products';
  }

  // -----------------------------------------------------------------------
  // SalesChannel implementation
  // -----------------------------------------------------------------------

  async createListing(product: Product): Promise<ProductOperationResult> {
    try {
      this.ensureOutputDir();

      const id = this.generateId(product.title);
      const filePath = path.join(this.outputDir, `${id}.json`);

      const payload = {
        id,
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');

      // Update the catalogue index
      this.updateCatalogue(id, product);

      return {
        success: true,
        listingId: id,
        message: `Product saved to ${filePath}`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to save product to website channel',
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  async updateListing(
    listingId: string,
    product: Partial<Product>,
  ): Promise<ProductOperationResult> {
    try {
      const filePath = path.join(this.outputDir, `${listingId}.json`);

      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          message: `Product ${listingId} not found`,
          errors: [`File not found: ${filePath}`],
        };
      }

      const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const updated = {
        ...existing,
        ...product,
        updatedAt: new Date().toISOString(),
      };

      fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');

      // Re-index catalogue
      this.updateCatalogue(listingId, updated);

      return {
        success: true,
        listingId,
        message: `Product ${listingId} updated`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update product',
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  async uploadImages(
    listingId: string,
    imageUrls: string[],
  ): Promise<ProductOperationResult> {
    try {
      const filePath = path.join(this.outputDir, `${listingId}.json`);

      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          message: `Product ${listingId} not found`,
          errors: [`File not found: ${filePath}`],
        };
      }

      const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const existingImages = existing.images ?? [];
      const newImages = imageUrls.map((url, i) => ({
        url,
        rank: existingImages.length + i + 1,
      }));

      existing.images = [...existingImages, ...newImages];
      existing.updatedAt = new Date().toISOString();

      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf-8');

      return {
        success: true,
        listingId,
        message: `${imageUrls.length} image(s) added to product JSON`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to add images',
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  isConfigured(): boolean {
    // The website channel only needs a writable output directory.
    return true;
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Maintains a `products.json` catalogue index in the output directory.
   */
  private updateCatalogue(id: string, product: Partial<Product>): void {
    const cataloguePath = path.join(this.outputDir, 'products.json');

    let catalogue: Record<string, unknown>[] = [];

    if (fs.existsSync(cataloguePath)) {
      try {
        catalogue = JSON.parse(fs.readFileSync(cataloguePath, 'utf-8'));
      } catch {
        catalogue = [];
      }
    }

    // Upsert entry
    const idx = catalogue.findIndex((p: any) => p.id === id);
    const entry = {
      id,
      title: product.title,
      price: product.price,
      quantity: product.quantity,
    };

    if (idx >= 0) {
      catalogue[idx] = { ...catalogue[idx], ...entry };
    } else {
      catalogue.push(entry);
    }

    fs.writeFileSync(
      cataloguePath,
      JSON.stringify(catalogue, null, 2),
      'utf-8',
    );
  }

  /**
   * Generates a URL-friendly ID from a product title.
   */
  private generateId(title: string): string {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const ts = Date.now().toString(36);
    return `${slug}-${ts}`;
  }
}
