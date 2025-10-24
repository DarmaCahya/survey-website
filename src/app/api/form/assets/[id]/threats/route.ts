import { NextRequest } from 'next/server';
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
 * Get threats for a specific asset
 * GET /api/form/assets/[id]/threats
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assetId = parseInt(params.id);
    
    if (isNaN(assetId)) {
      return handleApiError(new Error('Invalid asset ID'), 'Invalid asset ID');
    }

    const threats = await umkmSurveyService.getAssetThreats(assetId);
    return createSuccessResponse(threats, 'Threats retrieved successfully');
  } catch (error) {
    return handleApiError(error, 'Failed to retrieve threats');
  }
}
