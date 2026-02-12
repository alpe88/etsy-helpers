#!/usr/bin/env node

import { Command } from 'commander';
import { createAddProductCommand } from './commands/addProduct';

/**
 * Etsy Helpers CLI
 * Main entry point following Command Pattern
 */

const program = new Command();

program
  .name('etsy-helpers')
  .description('CLI tool for managing Etsy products with ease')
  .version('0.0.3');

// Register commands
program.addCommand(createAddProductCommand());

// Parse command-line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
