import { NextRequest } from 'next/server';
import { AssetRepository, ThreatRepository, SubmissionRepository, FormProgressRepository, AdminRepository } from '@/lib/repositories';
import { UMKMSurveyService } from '@/lib/umkm-survey-service';
import { riskCalculationService } from '@/lib/risk-calculation';
import { 
  handleApiError, 
  createSuccessResponse 
} from '@/lib/error-handler';

// Initialize services with dependency injection
const assetRepository = new AssetRepository();
const threatRepository = new ThreatRepository();
const submissionRepository = new SubmissionRepository();
const formProgressRepository = new FormProgressRepository();
const adminRepository = new AdminRepository();

const umkmSurveyService = new UMKMSurveyService(
  assetRepository,
  threatRepository,
  submissionRepository,
  formProgressRepository,
  adminRepository,
  riskCalculationService
);

/**
 * Get threats for a specific asset
 * GET /api/form/assets/[id]/threats
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const assetId = parseInt(resolvedParams.id);
    
    if (isNaN(assetId)) {
      return handleApiError(new Error('Invalid asset ID'), 'Invalid asset ID');
    }

    const threats = await umkmSurveyService.getAssetThreats(assetId);
    return createSuccessResponse(threats, 'Threats retrieved successfully');
  } catch (error) {
    return handleApiError(error, 'Failed to retrieve threats');
  }
}
