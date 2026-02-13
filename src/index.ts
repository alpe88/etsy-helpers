#!/usr/bin/env node

import { Command } from 'commander';
import { createAddProductCommand } from './commands/addProduct';
import { createValidateProductCommand } from './commands/validateProduct';

/**
 * POD Toolkit CLI
 *
 * A platform-independent tool for creating print-on-demand products
 * and publishing them to any sales channel (Etsy, your own website, etc.).
 */

const program = new Command();

program
  .name('pod-toolkit')
  .description(
    'CLI tool for creating and publishing print-on-demand products — independently of any single platform',
  )
  .version('1.0.0');

// Register commands
program.addCommand(createAddProductCommand());
program.addCommand(createValidateProductCommand());

// Parse command-line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
