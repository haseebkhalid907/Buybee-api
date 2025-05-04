# Buybee Data Seeder

This directory contains scripts and data files to populate the Buybee database with test data.

## Overview

The seeder system includes:

- A main seeder script (`seeder.js`) that handles the data import process
- Data files in the `data/` directory containing sample records for each model
- NPM scripts to run the seeder with different options

## Data Files

The seed data is organized into the following files:

- `users.seed.js` - Admin users, sellers, and buyers
- `categories.seed.js` - Product categories hierarchy
- `products.seed.js` - Products with detailed information
- `orders.seed.js` - Complete order records with order history

## Running the Seeder

### Basic Usage

To import all seed data while preserving existing records:

```bash
npm run seed
```

### Clear and Reseed

To clear all collections before importing (warning: this deletes all existing data):

```bash
npm run seed:clear
```

## Data Relationships

The seeder handles relationships between different models automatically:

1. Categories form a hierarchical structure
2. Products reference their respective categories and sellers
3. Orders reference customers, products, and sellers

## Extending the Seeder

To add more seed data:

1. Add or modify the data files in the `data/` directory
2. Update the main `seeder.js` script if necessary to handle the new data type
3. Run the seeder again

## Passwords

All test user accounts use the same password: `Password123`
