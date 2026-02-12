import { Command } from 'commander';
import { getConfig, validateConfig } from '../config';
import { EtsyService } from '../services/EtsyService';
import { ProductInput } from '../models/Product';
import { validateProductInput, convertToEtsyProduct } from '../utils/validation';

/**
 * Add Product Command
 * Follows Open/Closed Principle - can be extended without modification
 */
export function createAddProductCommand(): Command {
  const command = new Command('add-product');

  command
    .description('Add a new product listing to Etsy')
    .requiredOption('-t, --title <title>', 'Product title')
    .requiredOption('-d, --description <description>', 'Product description')
    .requiredOption('-p, --price <price>', 'Product price', parseFloat)
    .requiredOption('-q, --quantity <quantity>', 'Available quantity', parseInt)
    .option('--tags <tags>', 'Comma-separated tags (max 13)', parseTags)
    .option('--materials <materials>', 'Comma-separated materials', parseMaterials)
    .option('--images <images>', 'Comma-separated image URLs', parseImages)
    .action(async (options) => {
      try {
        await handleAddProduct(options);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  return command;
}

/**
 * Handles the add-product command logic
 * @param options - Command options from CLI
 */
async function handleAddProduct(options: any): Promise<void> {
  // Prepare product input
  const productInput: ProductInput = {
    title: options.title,
    description: options.description,
    price: options.price,
    quantity: options.quantity,
    tags: options.tags,
    materials: options.materials,
    images: options.images,
  };

  // Validate input
  const validationErrors = validateProductInput(productInput);
  if (validationErrors.length > 0) {
    console.error('Validation errors:');
    validationErrors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }

  // Get and validate configuration
  const config = getConfig();
  validateConfig(config);

  // Create Etsy service
  const etsyService = new EtsyService(config);

  // Convert and create product
  const etsyProduct = convertToEtsyProduct(productInput);
  
  console.log('Creating product listing on Etsy...');
  console.log(`Title: ${etsyProduct.title}`);
  console.log(`Price: $${etsyProduct.price}`);
  console.log(`Quantity: ${etsyProduct.quantity}`);

  const result = await etsyService.createListing(etsyProduct);

  if (result.success) {
    console.log('\n✅ Success!');
    console.log(result.message);
    if (result.listingId) {
      console.log(`Listing ID: ${result.listingId}`);
    }

    // Upload images if provided
    if (productInput.images && productInput.images.length > 0 && result.listingId) {
      console.log('\nUploading images...');
      const imageResult = await etsyService.uploadImages(
        result.listingId,
        productInput.images
      );
      
      if (imageResult.success) {
        console.log(`✅ ${imageResult.message}`);
      } else {
        console.warn('⚠️  Warning: Failed to upload images');
        imageResult.errors?.forEach(error => console.warn(`  - ${error}`));
      }
    }
  } else {
    console.error('\n❌ Failed to create product listing');
    console.error(result.message);
    if (result.errors) {
      result.errors.forEach(error => console.error(`  - ${error}`));
    }
    process.exit(1);
  }
}

/**
 * Helper functions for parsing CLI options
 */

function parseTags(value: string): string[] {
  return value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
}

function parseMaterials(value: string): string[] {
  return value.split(',').map(material => material.trim()).filter(m => m.length > 0);
}

function parseImages(value: string): string[] {
  return value.split(',').map(url => url.trim()).filter(url => url.length > 0);
}
