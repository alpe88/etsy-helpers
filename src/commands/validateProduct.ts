import { Command } from 'commander';
import { ProductInput } from '../models/Product';
import { validateProductInput, toProduct } from '../utils/validation';

/**
 * Validate Product Command
 * Validates product data without making API calls.
 * Channel-independent — works the same regardless of where the product
 * will eventually be published.
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
 */
async function handleValidateProduct(options: any): Promise<void> {
  const isVerbose = options.verbose || false;

  console.log('🔍 Validating product data...\n');

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
    validationErrors.forEach((error) => console.error(`  - ${error}`));
    console.error('\n💡 Fix the errors above and try again.');
    process.exit(1);
  }

  // Convert to verify transformation
  const product = toProduct(productInput);

  console.log('✅ Validation successful!\n');
  console.log('📋 Product summary:');
  console.log(`  Title: ${product.title}`);
  console.log(
    `  Description: ${product.description.substring(0, 60)}${product.description.length > 60 ? '...' : ''}`,
  );
  console.log(`  Price: $${product.price.toFixed(2)}`);
  console.log(`  Quantity: ${product.quantity}`);

  if (product.tags && product.tags.length > 0) {
    console.log(`  Tags (${product.tags.length}): ${product.tags.join(', ')}`);
  }

  if (product.materials && product.materials.length > 0) {
    console.log(
      `  Materials (${product.materials.length}): ${product.materials.join(', ')}`,
    );
  }

  if (productInput.images && productInput.images.length > 0) {
    console.log(`  Images: ${productInput.images.length} URL(s) provided`);
  }

  if (isVerbose) {
    console.log('\n📋 Product payload preview:');
    console.log(JSON.stringify(product, null, 2));
  }

  console.log('\n💡 Product is valid and ready to be published!');
  console.log(
    '   Use "add-product" command with --channel to create the listing.',
  );
}

/**
 * Helper functions for parsing CLI options
 */

function parseTags(value: string): string[] {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

function parseMaterials(value: string): string[] {
  return value
    .split(',')
    .map((material) => material.trim())
    .filter((m) => m.length > 0);
}

function parseImages(value: string): string[] {
  return value
    .split(',')
    .map((url) => url.trim())
    .filter((url) => url.length > 0);
}
