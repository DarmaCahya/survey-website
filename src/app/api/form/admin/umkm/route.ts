import { 
  AssetRepository, 
  SubmissionRepository, 
  ThreatRepository,
  FormProgressRepository,
  AdminRepository 
} from '@/lib/repositories';
import { UMKMSurveyService } from '@/lib/umkm-survey-service';
import { riskCalculationService } from '@/lib/risk-calculation';
import { withAdminPin } from '@/lib/admin-pin-service';
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
 * Get UMKM progress for admin dashboard
 * GET /api/form/admin/umkm
 * Protected with admin PIN
 */
async function getUMKMProgress() {
  try {
    const progress = await umkmSurveyService.getUMKMProgress();
    return createSuccessResponse(progress, 'UMKM progress retrieved successfully');
  } catch (error) {
    return handleApiError(error, 'Failed to retrieve UMKM progress');
  }
}

// Export protected route handler
export const GET = withAdminPin(getUMKMProgress);
