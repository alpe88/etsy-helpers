# POD Toolkit

A platform-independent CLI for creating and publishing print-on-demand products. Create products once and publish them to **any sales channel** — Etsy, your own website, or both.

## Key Ideas

- **Products are channel-independent.** You define a product (title, price, images, etc.) and then choose where to publish it.
- **Sales channels are pluggable.** Etsy is one channel. Your own website is another. Adding more (Shopify, Amazon, etc.) is just a matter of implementing the `SalesChannel` interface.
- **Print providers are separate.** Printful (or any other POD provider) handles fulfilment — completely decoupled from where you sell.

## Features

- **Website channel** — export products as JSON files that any website framework can consume (Next.js, Gatsby, plain HTML, etc.). No API credentials needed.
- **Etsy channel** — publish directly to your Etsy shop via the v3 API.
- **Printful integration** — pull products from your Printful store and publish them anywhere.
- **Dry-run mode** — validate product data and check configuration without making any API calls.
- **Verbose mode** — detailed debug output for troubleshooting.
- **Validation command** — standalone product data validation.
- **TypeScript + SOLID architecture** — clean, typed, and extensible.

## Quick Start

```bash
# Install dependencies
npm install

# Build
npm run build

# Create a product on the website channel (default — no API keys needed)
node dist/index.js add-product \
  -t "Cool T-Shirt" \
  -d "Premium cotton tee with a custom design" \
  -p 29.99 \
  -q 50

# Create the same product on Etsy (requires API credentials)
node dist/index.js add-product \
  -t "Cool T-Shirt" \
  -d "Premium cotton tee with a custom design" \
  -p 29.99 \
  -q 50 \
  --channel etsy
```

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in only the sections you need:

```bash
cp .env.example .env
```

| Variable | Required for | Description |
| --- | --- | --- |
| `ETSY_API_KEY` | Etsy channel | Your Etsy app API key |
| `ETSY_TOKEN` | Etsy channel | OAuth token for your shop |
| `ETSY_SHOP_ID` | Etsy channel | Numeric shop ID |
| `PRINTFUL_API_KEY` | Printful provider | Printful API key |
| `WEBSITE_OUTPUT_DIR` | Website channel | Output directory (default: `./products`) |

### 2. Choose Your Channel

| Channel | Flag | What it does |
| --- | --- | --- |
| **Website** (default) | `--channel website` | Writes product JSON to `./products/` |
| **Etsy** | `--channel etsy` | Creates a listing via the Etsy v3 API |

## Usage

### Validate Product Before Creating

Before publishing a product, you can validate your data to ensure it meets all requirements:

```bash
node dist/index.js validate-product \
  --title "Beautiful Handmade Mug" \
  --description "A stunning ceramic mug, handcrafted with love" \
  --price 24.99 \
  --quantity 10 \
  --tags "mug,ceramic,handmade,gift" \
  --materials "ceramic,glaze"
```

Add `--verbose` flag for detailed validation output.

### `add-product`

```
pod-toolkit add-product [options]
```

**Required:**

| Option | Description |
| --- | --- |
| `-t, --title <title>` | Product title (max 140 chars) |
| `-d, --description <desc>` | Product description |
| `-p, --price <price>` | Product price (> 0) |
| `-q, --quantity <qty>` | Available quantity (>= 0) |

**Optional:**

| Option | Description |
| --- | --- |
| `-c, --channel <channel>` | Sales channel (`website`, `etsy`). Default: `website` |
| `--tags <tags>` | Comma-separated tags (max 13, each max 20 chars) |
| `--materials <materials>` | Comma-separated materials |
| `--images <urls>` | Comma-separated image URLs |
| `--dry-run` | Validate without making API calls |
| `--verbose` | Show detailed debug output |

### `validate-product`

Validate product data without publishing to any channel.

**Required:** Same as `add-product` (`-t`, `-d`, `-p`, `-q`).

**Optional:**
- `--tags`, `--materials`, `--images` — same as `add-product`
- `--verbose` — show detailed validation output

## Debugging and Testing

### Dry Run Mode

Test your product data without making actual API calls:

```bash
node dist/index.js add-product \
  -t "Test Product" \
  -d "Test description" \
  -p 19.99 \
  -q 10 \
  --dry-run
```

The `--dry-run` flag validates all data and checks configuration without calling any API.

### Verbose Mode

Get detailed debug output for troubleshooting:

```bash
node dist/index.js add-product \
  -t "Test Product" \
  -d "Test description" \
  -p 19.99 \
  -q 10 \
  --verbose
```

### Combine Flags

You can combine `--dry-run` and `--verbose` for comprehensive debugging:

```bash
node dist/index.js add-product \
  -t "Test Product" \
  -d "Test description" \
  -p 19.99 \
  -q 10 \
  --channel etsy \
  --dry-run --verbose
```

### Examples

```bash
# Simple product → website
node dist/index.js add-product \
  -t "Vintage Coffee Mug" \
  -d "Classic vintage-style coffee mug" \
  -p 15.99 -q 5

# Product with tags and images → Etsy
node dist/index.js add-product \
  -t "Custom T-Shirt" \
  -d "Premium cotton t-shirt with custom design" \
  -p 29.99 -q 20 \
  --channel etsy \
  --tags "tshirt,clothing,custom,cotton" \
  --images "https://example.com/front.jpg,https://example.com/back.jpg"
```

## Architecture

```
src/
├── commands/           # CLI commands (Command Pattern)
│   ├── addProduct.ts
│   └── validateProduct.ts
├── services/           # Channel & provider implementations
│   ├── SalesChannel.ts     # Interface — any storefront
│   ├── PrintProvider.ts    # Interface — any POD provider
│   ├── EtsyService.ts      # Etsy implementation of SalesChannel
│   ├── WebsiteChannel.ts   # Website implementation of SalesChannel
│   └── PrintfulService.ts  # Printful implementation of PrintProvider
├── models/
│   └── Product.ts          # Platform-agnostic product models
├── utils/
│   ├── validation.ts       # Input validation (channel-independent)
│   └── validation.test.ts  # Validation tests
├── config/
│   ├── index.ts            # Configuration management
│   └── index.test.ts       # Config tests
└── index.ts                # CLI entry point
```

### Extending with a New Sales Channel

1. Create a new file in `src/services/` that implements `SalesChannel`.
2. Register it in the `resolveChannel()` factory inside `src/commands/addProduct.ts`.
3. Add any config it needs to the `Config` interface.

### Extending with a New Print Provider

1. Create a new file in `src/services/` that implements `PrintProvider`.
2. Use it from your commands to pull products and publish them through any `SalesChannel`.

## Website Channel Details

The website channel writes product data as JSON files to a local directory (default `./products/`):

- **Individual files:** `./products/<slug>-<id>.json` — full product data.
- **Catalogue index:** `./products/products.json` — lightweight array of all products (id, title, price, quantity).

You can consume these files from any web framework to build your own storefront — a static site generator, a React app, or even a simple HTML page with `fetch()`.

## Development

```bash
npm run build          # Compile TypeScript
npm run dev -- <args>  # Run directly with ts-node
```

### Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

## Error Handling

The CLI provides clear error messages:

- **Validation Errors**: Input data validation failures
- **Configuration Errors**: Missing or invalid API credentials
- **API Errors**: Detailed error messages from channel APIs
- **Network Errors**: Connection issues

## Roadmap

- [ ] Interactive mode for product creation
- [ ] Bulk product import from CSV
- [ ] Printful → any-channel sync automation
- [ ] Product templates
- [ ] Update and delete commands
- [ ] Shopify sales channel
- [ ] Image optimization
- [ ] Inventory management across channels

## License

UNLICENSED
