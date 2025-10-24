import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { AssetRepository } from '@/lib/repositories';
import { UMKMSurveyService } from '@/lib/umkm-survey-service';
import { riskCalculationService } from '@/lib/risk-calculation';
import { 
  handleApiError, 
  createSuccessResponse 
} from '@/lib/error-handler';

// Initialize services with dependency injection
const assetRepository = new AssetRepository();
const umkmSurveyService = new UMKMSurveyService(
  assetRepository,
  {} as any, // Will be injected properly in other endpoints
  {} as any,
  {} as any,
  riskCalculationService
);

/**
 * Get all assets with threat counts
 * GET /api/form/assets
 */
export async function GET(request: NextRequest) {
  try {
    const assets = await umkmSurveyService.getAssets();
    return createSuccessResponse(assets, 'Assets retrieved successfully');
  } catch (error) {
    return handleApiError(error, 'Failed to retrieve assets');
  }
}
