import { Command } from 'commander';
import { ProductInput } from '../models/Product';
import { validateProductInput, convertToEtsyProduct } from '../utils/validation';

/**
 * Validate Product Command
 * Validates product data without making API calls
 * Follows Single Responsibility Principle
 */
export function createValidateProductCommand(): Command {
  const command = new Command('validate-product');

  command
    .description('Validate product data without creating a listing')
    .requiredOption('-t, --title <title>', 'Product title')
    .requiredOption('-d, --description <description>', 'Product description')
    .requiredOption('-p, --price <price>', 'Product price', parseFloat)
    .requiredOption('-q, --quantity <quantity>', 'Available quantity', parseInt)
    .option('--tags <tags>', 'Comma-separated tags (max 13)', parseTags)
    .option('--materials <materials>', 'Comma-separated materials', parseMaterials)
    .option('--images <images>', 'Comma-separated image URLs', parseImages)
    .option('--verbose', 'Show detailed validation output')
    .action(async (options) => {
      try {
        await handleValidateProduct(options);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  return command;
}

/**
 * Handles the validate-product command logic
 * @param options - Command options from CLI
 */
async function handleValidateProduct(options: any): Promise<void> {
  const isVerbose = options.verbose || false;

  console.log('🔍 Validating product data...\n');

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
    console.log('📦 Product input:');
    console.log(JSON.stringify(productInput, null, 2));
    console.log();
  }

  // Validate input
  const validationErrors = validateProductInput(productInput);
  
  if (validationErrors.length > 0) {
    console.error('❌ Validation failed:\n');
    validationErrors.forEach(error => console.error(`  - ${error}`));
    console.error('\n💡 Fix the errors above and try again.');
    process.exit(1);
  }

  // Convert to Etsy format to verify transformation
  const etsyProduct = convertToEtsyProduct(productInput);

  console.log('✅ Validation successful!\n');
  console.log('📋 Product summary:');
  console.log(`  Title: ${etsyProduct.title}`);
  console.log(`  Description: ${etsyProduct.description.substring(0, 60)}${etsyProduct.description.length > 60 ? '...' : ''}`);
  console.log(`  Price: $${etsyProduct.price.toFixed(2)}`);
  console.log(`  Quantity: ${etsyProduct.quantity}`);

  if (etsyProduct.tags && etsyProduct.tags.length > 0) {
    console.log(`  Tags (${etsyProduct.tags.length}): ${etsyProduct.tags.join(', ')}`);
  }

  if (etsyProduct.materials && etsyProduct.materials.length > 0) {
    console.log(`  Materials (${etsyProduct.materials.length}): ${etsyProduct.materials.join(', ')}`);
  }

  if (productInput.images && productInput.images.length > 0) {
    console.log(`  Images: ${productInput.images.length} URL(s) provided`);
  }

  if (isVerbose) {
    console.log('\n📋 Etsy API payload preview:');
    console.log(JSON.stringify(etsyProduct, null, 2));
  }

  console.log('\n💡 Product is ready to be submitted to Etsy!');
  console.log('   Use "add-product" command to create the listing.');
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
