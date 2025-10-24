import { NextRequest } from 'next/server';
import { 
  AssetRepository, 
  SubmissionRepository, 
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
const formProgressRepository = new FormProgressRepository();
const adminRepository = new AdminRepository();

const umkmSurveyService = new UMKMSurveyService(
  assetRepository,
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
async function getUMKMProgress(request: NextRequest) {
  try {
    const progress = await umkmSurveyService.getUMKMProgress();
    return createSuccessResponse(progress, 'UMKM progress retrieved successfully');
  } catch (error) {
    return handleApiError(error, 'Failed to retrieve UMKM progress');
  }
}

// Export protected route handler
export const GET = withAdminPin(getUMKMProgress);
