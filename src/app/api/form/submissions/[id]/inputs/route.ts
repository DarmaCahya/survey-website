import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { jwtService } from '@/lib/jwt';
import { AuthService } from '@/lib/auth-service';
import { UserRepository } from '@/lib/user-repository';
import { passwordService } from '@/lib/password';
import { 
  AssetRepository, 
  SubmissionRepository, 
  FormProgressRepository,
  AdminRepository 
} from '@/lib/repositories';
import { UMKMSurveyService } from '@/lib/umkm-survey-service';
import { riskCalculationService } from '@/lib/risk-calculation';
import { 
  handleApiError, 
  createSuccessResponse,
  createAuthErrorResponse,
  validateRequestBody 
} from '@/lib/error-handler';
import { SubmitInputsRequest } from '@/types/risk';

// Initialize services with dependency injection
const userRepository = new UserRepository(db);
const authService = new AuthService(userRepository, passwordService, jwtService);
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
 * Submit risk assessment inputs
 * POST /api/form/submissions/[id]/inputs
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return createAuthErrorResponse('Authorization header is required');
    }

    const token = jwtService.extractTokenFromHeader(authHeader);
    if (!token) {
      return createAuthErrorResponse('Invalid authorization header format');
    }

    const user = await authService.validateToken(token);
    if (!user) {
      return createAuthErrorResponse('Invalid or expired token');
    }

    // Validate submission ID
    const submissionId = parseInt(params.id);
    if (isNaN(submissionId)) {
      return handleApiError(new Error('Invalid submission ID'), 'Invalid submission ID');
    }

    // Validate request body
    const body = await request.json();
    validateRequestBody(body, ['f', 'g', 'h', 'i', 'understand']);

    const inputsRequest: SubmitInputsRequest = {
      f: body.f,
      g: body.g,
      h: body.h,
      i: body.i,
      understand: body.understand
    };

    const result = await umkmSurveyService.submitInputs(user.id, submissionId, inputsRequest);
    return createSuccessResponse(result, 'Inputs submitted successfully');

  } catch (error) {
    return handleApiError(error, 'Failed to submit inputs');
  }
}
