-- Convert quarter column to month column in submissions table
-- This migration transforms existing quarter data to month based on submittedAt date

-- Step 1: Add new month column as nullable
ALTER TABLE "submissions" ADD COLUMN IF NOT EXISTS "month" INTEGER;

-- Step 2: Transform existing quarter data to month based on submittedAt
-- Extract month directly from submittedAt (1-12)
UPDATE "submissions"
SET "month" = EXTRACT(MONTH FROM "submittedAt")
WHERE "month" IS NULL;

-- Step 3: For any records that still don't have month (safety check)
-- Set to current month based on submittedAt or current timestamp
UPDATE "submissions"
SET "month" = COALESCE(
  EXTRACT(MONTH FROM "submittedAt"),
  EXTRACT(MONTH FROM CURRENT_TIMESTAMP)
)
WHERE "month" IS NULL;

-- Step 4: Make month column NOT NULL
ALTER TABLE "submissions" ALTER COLUMN "month" SET NOT NULL;

-- Step 5: Drop old unique constraint with quarter
DROP INDEX IF EXISTS "submissions_userId_assetId_threatId_quarter_year_key";

-- Step 6: Drop old index with quarter
DROP INDEX IF EXISTS "submissions_userId_assetId_quarter_year_idx";

-- Step 7: Create new unique constraint with month and year
CREATE UNIQUE INDEX "submissions_userId_assetId_threatId_month_year_key" 
ON "submissions"("userId", "assetId", "threatId", "month", "year");

-- Step 8: Create new index for performance with month
CREATE INDEX IF NOT EXISTS "submissions_userId_assetId_month_year_idx" 
ON "submissions"("userId", "assetId", "month", "year");

-- Step 9: Drop the old quarter column (after ensuring month is populated)
ALTER TABLE "submissions" DROP COLUMN IF EXISTS "quarter";

