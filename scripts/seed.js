#!/usr/bin/env node

/**
 * Seed script runner for UMKM Cyber Risk Survey
 */

import { seedDatabase } from '../src/lib/seed';

console.log('🚀 Starting UMKM Cyber Risk Survey Database Seeding...\n');

seedDatabase()
  .then(() => {
    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
