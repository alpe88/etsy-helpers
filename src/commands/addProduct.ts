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
    .option('--dry-run', 'Validate without making API calls')
    .option('--verbose', 'Show detailed debug output')
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
  const isDryRun = options.dryRun || false;
  const isVerbose = options.verbose || false;

  if (isVerbose) {
    console.log('🔍 Verbose mode enabled');
    console.log('Options received:', JSON.stringify(options, null, 2));
  }

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

  if (isVerbose) {
    console.log('\n📦 Product input prepared:');
    console.log(JSON.stringify(productInput, null, 2));
  }

  // Validate input
  const validationErrors = validateProductInput(productInput);
  if (validationErrors.length > 0) {
    console.error('❌ Validation errors:');
    validationErrors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }

  if (isVerbose) {
    console.log('\n✅ Validation passed');
  }

  // Get and validate configuration
  const config = getConfig();
  
  if (isDryRun) {
    if (isVerbose) {
      console.log('\n🔧 Configuration check (dry-run mode):');
      console.log(`  API Key: ${config.etsy.apiKey ? '✅ Set' : '❌ Missing'}`);
      console.log(`  Token: ${config.etsy.token ? '✅ Set' : '❌ Missing'}`);
      console.log(`  Shop ID: ${config.etsy.shopId ? '✅ Set' : '❌ Missing'}`);
    }
  } else {
    validateConfig(config);
  }

  // Convert to Etsy product format
  const etsyProduct = convertToEtsyProduct(productInput);
  
  console.log('\n' + (isDryRun ? '🧪 DRY RUN: Would create product listing with:' : '📝 Creating product listing on Etsy...'));
  console.log(`Title: ${etsyProduct.title}`);
  console.log(`Price: $${etsyProduct.price}`);
  console.log(`Quantity: ${etsyProduct.quantity}`);

  if (etsyProduct.tags && etsyProduct.tags.length > 0) {
    console.log(`Tags: ${etsyProduct.tags.join(', ')}`);
  }
  
  if (etsyProduct.materials && etsyProduct.materials.length > 0) {
    console.log(`Materials: ${etsyProduct.materials.join(', ')}`);
  }

  if (isVerbose) {
    console.log('\n📋 Etsy product payload:');
    console.log(JSON.stringify(etsyProduct, null, 2));
  }

  // Exit early in dry-run mode
  if (isDryRun) {
    console.log('\n✅ Dry run completed successfully!');
    console.log('💡 Product data is valid and ready to be submitted.');
    console.log('   Remove --dry-run flag to create the listing on Etsy.');
    return;
  }

  // Create Etsy service
  const etsyService = new EtsyService(config);

  if (isVerbose) {
    console.log('\n🌐 Making API request to Etsy...');
  }

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
