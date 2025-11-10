-- Add quarter and year columns to submissions table
-- First, add columns as nullable
ALTER TABLE "submissions" ADD COLUMN IF NOT EXISTS "quarter" INTEGER;
ALTER TABLE "submissions" ADD COLUMN IF NOT EXISTS "year" INTEGER;

-- Update existing records: set quarter and year based on submittedAt date
-- Q1: Jan-Mar (month 1-3), Q2: Apr-Jun (month 4-6), Q3: Jul-Sep (month 7-9), Q4: Oct-Dec (month 10-12)
UPDATE "submissions"
SET 
  "quarter" = CASE 
    WHEN EXTRACT(MONTH FROM "submittedAt") BETWEEN 1 AND 3 THEN 1
    WHEN EXTRACT(MONTH FROM "submittedAt") BETWEEN 4 AND 6 THEN 2
    WHEN EXTRACT(MONTH FROM "submittedAt") BETWEEN 7 AND 9 THEN 3
    WHEN EXTRACT(MONTH FROM "submittedAt") BETWEEN 10 AND 12 THEN 4
  END,
  "year" = EXTRACT(YEAR FROM "submittedAt")
WHERE "quarter" IS NULL OR "year" IS NULL;

-- For any records that still don't have quarter/year (shouldn't happen, but safety check)
-- Set to current quarter and year
UPDATE "submissions"
SET 
  "quarter" = CASE 
    WHEN EXTRACT(MONTH FROM CURRENT_TIMESTAMP) BETWEEN 1 AND 3 THEN 1
    WHEN EXTRACT(MONTH FROM CURRENT_TIMESTAMP) BETWEEN 4 AND 6 THEN 2
    WHEN EXTRACT(MONTH FROM CURRENT_TIMESTAMP) BETWEEN 7 AND 9 THEN 3
    WHEN EXTRACT(MONTH FROM CURRENT_TIMESTAMP) BETWEEN 10 AND 12 THEN 4
  END,
  "year" = EXTRACT(YEAR FROM CURRENT_TIMESTAMP)
WHERE "quarter" IS NULL OR "year" IS NULL;

-- Make columns NOT NULL
ALTER TABLE "submissions" ALTER COLUMN "quarter" SET NOT NULL;
ALTER TABLE "submissions" ALTER COLUMN "year" SET NOT NULL;

-- Drop old unique constraint if it exists
DROP INDEX IF EXISTS "submissions_userId_assetId_threatId_key";

-- Create new unique constraint with quarter and year
CREATE UNIQUE INDEX "submissions_userId_assetId_threatId_quarter_year_key" ON "submissions"("userId", "assetId", "threatId", "quarter", "year");

-- Create index for performance
CREATE INDEX IF NOT EXISTS "submissions_userId_assetId_quarter_year_idx" ON "submissions"("userId", "assetId", "quarter", "year");

