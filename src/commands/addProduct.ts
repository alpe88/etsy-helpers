import { Command } from 'commander';
import { getConfig, validateChannelConfig } from '../config';
import { EtsyService } from '../services/EtsyService';
import { WebsiteChannel } from '../services/WebsiteChannel';
import { SalesChannel } from '../services/SalesChannel';
import { ProductInput } from '../models/Product';
import {
  validateProductInput,
  toProduct,
  isValidChannel,
  SUPPORTED_CHANNELS,
} from '../utils/validation';

/**
 * Add Product Command
 *
 * Publishes a product to the chosen sales channel.
 * Defaults to "website" so products can be created without any
 * third-party API credentials.
 */
export function createAddProductCommand(): Command {
  const command = new Command('add-product');

  command
    .description('Add a new product listing')
    .requiredOption('-t, --title <title>', 'Product title')
    .requiredOption('-d, --description <description>', 'Product description')
    .requiredOption('-p, --price <price>', 'Product price', parseFloat)
    .requiredOption('-q, --quantity <quantity>', 'Available quantity', parseInt)
    .option(
      '-c, --channel <channel>',
      `Sales channel to publish to (${SUPPORTED_CHANNELS.join(', ')})`,
      'website',
    )
    .option('--tags <tags>', 'Comma-separated tags (max 13)', parseTags)
    .option(
      '--materials <materials>',
      'Comma-separated materials',
      parseMaterials,
    )
    .option('--images <images>', 'Comma-separated image URLs', parseImages)
    .option('--dry-run', 'Validate without making API calls')
    .option('--verbose', 'Show detailed debug output')
    .action(async (options) => {
      try {
        await handleAddProduct(options);
      } catch (error) {
        console.error(
          'Error:',
          error instanceof Error ? error.message : error,
        );
        process.exit(1);
      }
    });

  return command;
}

// ---------------------------------------------------------------------------
// Command handler
// ---------------------------------------------------------------------------

async function handleAddProduct(options: any): Promise<void> {
  const isDryRun = options.dryRun || false;
  const isVerbose = options.verbose || false;

  if (isVerbose) {
    console.log('🔍 Verbose mode enabled');
    console.log('Options received:', JSON.stringify(options, null, 2));
  }

  // Validate channel choice
  const channelName: string = options.channel;
  if (!isValidChannel(channelName)) {
    console.error(
      `Unknown channel "${channelName}". Supported: ${SUPPORTED_CHANNELS.join(', ')}`,
    );
    process.exit(1);
  }

  // Build product input
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

  // Validate input (channel-agnostic)
  const validationErrors = validateProductInput(productInput);
  if (validationErrors.length > 0) {
    console.error('❌ Validation errors:');
    validationErrors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }

  if (isVerbose) {
    console.log('\n✅ Validation passed');
  }

  // Config & channel setup
  const config = getConfig();

  if (isDryRun) {
    if (isVerbose) {
      console.log(`\n🔧 Configuration check (dry-run mode) for channel "${channelName}":`);
      if (channelName === 'etsy') {
        console.log(`  API Key: ${config.etsy?.apiKey ? '✅ Set' : '❌ Missing'}`);
        console.log(`  Token: ${config.etsy?.token ? '✅ Set' : '❌ Missing'}`);
        console.log(`  Shop ID: ${config.etsy?.shopId ? '✅ Set' : '❌ Missing'}`);
      } else if (channelName === 'website') {
        console.log(`  Output Dir: ${config.website?.outputDir ?? './products'}`);
      }
    }
  } else {
    validateChannelConfig(config, channelName);
  }

  // Convert to platform-agnostic product
  const product = toProduct(productInput);

  console.log(
    '\n' +
      (isDryRun
        ? `🧪 DRY RUN: Would publish to ${channelName} with:`
        : `Publishing product to ${channelName}...`),
  );
  console.log(`  Title:    ${product.title}`);
  console.log(`  Price:    $${product.price}`);
  console.log(`  Quantity: ${product.quantity}`);

  if (product.tags && product.tags.length > 0) {
    console.log(`  Tags:     ${product.tags.join(', ')}`);
  }

  if (product.materials && product.materials.length > 0) {
    console.log(`  Materials: ${product.materials.join(', ')}`);
  }

  if (isVerbose) {
    console.log('\n📋 Product payload:');
    console.log(JSON.stringify(product, null, 2));
  }

  // Exit early in dry-run mode
  if (isDryRun) {
    console.log('\n✅ Dry run completed successfully!');
    console.log('💡 Product data is valid and ready to be submitted.');
    console.log(`   Remove --dry-run flag to publish to ${channelName}.`);
    return;
  }

  const channel: SalesChannel = resolveChannel(channelName, config);

  if (!channel.isConfigured()) {
    console.error(
      `The "${channelName}" channel is not fully configured. Check your .env file.`,
    );
    process.exit(1);
  }

  if (isVerbose) {
    console.log(`\n🌐 Publishing to ${channel.name}...`);
  }

  const result = await channel.createListing(product);

  if (result.success) {
    console.log('\n✅ Success!');
    console.log(result.message);
    if (result.listingId) {
      console.log(`Listing ID: ${result.listingId}`);
    }

    // Upload images if provided
    if (
      productInput.images &&
      productInput.images.length > 0 &&
      result.listingId
    ) {
      console.log('\nUploading images...');
      const imageResult = await channel.uploadImages(
        result.listingId,
        productInput.images,
      );

      if (imageResult.success) {
        console.log(`✅ ${imageResult.message}`);
      } else {
        console.warn('⚠️  Warning: Failed to upload images');
        imageResult.errors?.forEach((e) => console.warn(`  - ${e}`));
      }
    }
  } else {
    console.error('\n❌ Failed to create product listing');
    console.error(result.message);
    result.errors?.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Channel factory
// ---------------------------------------------------------------------------

function resolveChannel(name: string, config: any): SalesChannel {
  switch (name) {
    case 'etsy':
      return new EtsyService(config);
    case 'website':
      return new WebsiteChannel(config);
    default:
      throw new Error(`Unsupported channel: ${name}`);
  }
}

// ---------------------------------------------------------------------------
// CLI option parsers
// ---------------------------------------------------------------------------

function parseTags(value: string): string[] {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

function parseMaterials(value: string): string[] {
  return value
    .split(',')
    .map((m) => m.trim())
    .filter((m) => m.length > 0);
}

function parseImages(value: string): string[] {
  return value
    .split(',')
    .map((url) => url.trim())
    .filter((url) => url.length > 0);
}
