# etsy-helpers

Adding products to Etsy is now like smooth sailing with cool breeze 🌊

A powerful CLI tool for managing Etsy products programmatically. Built with TypeScript and following SOLID principles for maintainability and extensibility.

## Features

- 🚀 **Easy Product Creation**: Add products to Etsy with simple CLI commands
- 🔧 **TypeScript**: Fully typed for better development experience
- 🎯 **SOLID Architecture**: Clean, maintainable, and extensible codebase
- 🔌 **Etsy API v3**: Uses the latest Etsy API
- 📦 **Printful Integration**: Ready for Printful integration (optional)
- ✅ **Validation**: Built-in validation for product data

## Installation

### Local Development

```bash
# Clone the repository
git clone https://github.com/alpe88/etsy-helpers.git
cd etsy-helpers

# Install dependencies
npm install

# Build the project
npm run build
```

### Global Installation (Coming Soon)

```bash
npm install -g etsy-helpers
```

## Setup

### 1. Get Etsy API Credentials

You'll need to register an app with Etsy to get API credentials:

1. Go to [Etsy Developers](https://www.etsy.com/developers/)
2. Create a new app
3. Get your API Key
4. Generate an OAuth token for your shop
5. Find your Shop ID

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
ETSY_API_KEY=your_etsy_api_key
ETSY_TOKEN=your_etsy_oauth_token
ETSY_SHOP_ID=your_shop_id

# Optional: For Printful integration
PRINTFUL_API_KEY=your_printful_api_key
```

## Usage

### Add a Product to Etsy

```bash
node dist/index.js add-product \
  --title "Beautiful Handmade Mug" \
  --description "A stunning ceramic mug, handcrafted with love" \
  --price 24.99 \
  --quantity 10 \
  --tags "mug,ceramic,handmade,gift" \
  --materials "ceramic,glaze" \
  --images "https://example.com/image1.jpg,https://example.com/image2.jpg"
```

### Command Options

#### `add-product`

Add a new product listing to Etsy.

**Required Options:**
- `-t, --title <title>`: Product title (max 140 characters)
- `-d, --description <description>`: Product description
- `-p, --price <price>`: Product price (must be > 0)
- `-q, --quantity <quantity>`: Available quantity (must be >= 0)

**Optional Options:**
- `--tags <tags>`: Comma-separated tags (max 13 tags, each max 20 characters)
- `--materials <materials>`: Comma-separated materials
- `--images <images>`: Comma-separated image URLs

### Examples

#### Simple Product

```bash
node dist/index.js add-product \
  -t "Vintage Coffee Mug" \
  -d "Classic vintage-style coffee mug" \
  -p 15.99 \
  -q 5
```

#### Product with Tags and Materials

```bash
node dist/index.js add-product \
  -t "Handwoven Basket" \
  -d "Beautiful handwoven basket made from natural materials" \
  -p 45.00 \
  -q 3 \
  --tags "basket,handwoven,home decor,storage" \
  --materials "rattan,wood,cotton"
```

#### Product with Images

```bash
node dist/index.js add-product \
  -t "Custom T-Shirt" \
  -d "Premium cotton t-shirt with custom design" \
  -p 29.99 \
  -q 20 \
  --tags "tshirt,clothing,custom,cotton" \
  --images "https://example.com/front.jpg,https://example.com/back.jpg"
```

## Architecture

This project follows SOLID principles and clean architecture:

```
src/
├── commands/       # CLI commands (Command Pattern)
├── services/       # API services (Single Responsibility)
├── models/         # Data models and interfaces
├── utils/          # Helper utilities
├── config/         # Configuration management
└── index.ts        # Main CLI entry point
```

### Key Principles

- **Single Responsibility**: Each class/module has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable for their base types
- **Interface Segregation**: Many specific interfaces over one general interface
- **Dependency Inversion**: Depend on abstractions, not concretions

## API Integration

### Etsy API v3

The tool uses Etsy's latest API v3 for all operations. Key endpoints:

- `POST /shops/{shop_id}/listings` - Create listings
- `PATCH /shops/{shop_id}/listings/{listing_id}` - Update listings
- `POST /shops/{shop_id}/listings/{listing_id}/images` - Upload images

### Printful Integration (Coming Soon)

Printful integration is being developed to sync products from Printful to Etsy automatically.

## Development

### Build

```bash
npm run build
```

### Run in Development Mode

```bash
npm run dev -- add-product -t "Test" -d "Test description" -p 10 -q 5
```

### Project Structure

```
etsy-helpers/
├── src/
│   ├── commands/
│   │   └── addProduct.ts      # Add product command
│   ├── services/
│   │   ├── EtsyService.ts     # Etsy API integration
│   │   └── PrintfulService.ts # Printful API integration
│   ├── models/
│   │   └── Product.ts         # Product interfaces
│   ├── utils/
│   │   └── validation.ts      # Validation utilities
│   ├── config/
│   │   └── index.ts           # Configuration management
│   └── index.ts               # CLI entry point
├── dist/                      # Compiled JavaScript
├── tsconfig.json              # TypeScript configuration
└── package.json               # Project dependencies
```

## Error Handling

The CLI provides clear error messages:

- **Validation Errors**: Input data validation failures
- **Configuration Errors**: Missing or invalid API credentials
- **API Errors**: Detailed error messages from Etsy API
- **Network Errors**: Connection issues

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Follow existing code style and SOLID principles
4. Add tests for new features
5. Submit a pull request

## License

UNLICENSED

## Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/alpe88/etsy-helpers/issues)
- Check [Etsy API Documentation](https://developers.etsy.com/documentation)

## Roadmap

- [ ] Interactive mode for product creation
- [ ] Bulk product import from CSV
- [ ] Printful sync automation
- [ ] Product templates
- [ ] Update and delete commands
- [ ] Image optimization
- [ ] Inventory management
- [ ] Sales analytics

---

Built with ❤️ using TypeScript and Commander.js
