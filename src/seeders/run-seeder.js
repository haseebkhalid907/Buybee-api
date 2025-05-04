#!/usr/bin/env node

/**
 * Script to run the database seeder
 * Usage: node run-seeder.js
 */

// Import the seed function
const seed = require('./seed');

// Run the seeder
console.log('Starting database seeder...');
seed()
    .then(() => {
        console.log('Seeding completed successfully.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error running seeder:', error);
        process.exit(1);
    });