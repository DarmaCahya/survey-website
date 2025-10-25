import { AssetRepository, SubmissionRepository, ThreatRepository, FormProgressRepository, AdminRepository } from '@/lib/repositories';
import { UMKMSurveyService } from '@/lib/umkm-survey-service';
import { riskCalculationService } from '@/lib/risk-calculation';
import { 
  handleApiError, 
  createSuccessResponse 
} from '@/lib/error-handler';

// Initialize services with dependency injection
const assetRepository = new AssetRepository();
const submissionRepository = new SubmissionRepository();
const threatRepository = new ThreatRepository();
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
 * Get all assets with threat counts
 * GET /api/form/assets
 */
export async function GET() {
  try {
    const assets = await umkmSurveyService.getAssets();
    return createSuccessResponse(assets, 'Assets retrieved successfully');
  } catch (error) {
    return handleApiError(error, 'Failed to retrieve assets');
  }
}
