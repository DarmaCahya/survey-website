-- AlterTable
-- This migration adds explanation field to threat_business_processes table
-- This is a safe migration as it only adds a nullable column
ALTER TABLE "threat_business_processes" ADD COLUMN "explanation" TEXT;

-- Note: After migration, run the backfill script to populate existing data
-- from jenis_data_dan_threats_with_explanations.json

