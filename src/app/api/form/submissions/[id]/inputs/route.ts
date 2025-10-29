import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { jwtService } from '@/lib/jwt';
import { AuthService } from '@/lib/auth-service';
import { UserRepository } from '@/lib/user-repository';
import { passwordService } from '@/lib/password';
import { 
  AssetRepository, 
  ThreatRepository,
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
import { SubmitInputsRequest, FormStatus } from '@/types/risk';

// Initialize services with dependency injection
const userRepository = new UserRepository(db);
const authService = new AuthService(userRepository, passwordService, jwtService);
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
 * Submit risk assessment inputs
 * POST /api/form/submissions/[id]/inputs
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Await params for Next.js 15 compatibility
    const resolvedParams = await params;
    
    // Validate submission ID
    const submissionId = parseInt(resolvedParams.id);
    if (isNaN(submissionId)) {
      return handleApiError(new Error('Invalid submission ID'), 'Invalid submission ID');
    }

    // Validate request body with error handling
    let body;
    try {
      const rawBody = await request.text();
      console.log('Raw request body:', rawBody);
      console.log('Content-Type:', request.headers.get('content-type'));
      
      if (!rawBody || rawBody.trim() === '') {
        return handleApiError(new Error('Empty request body'), 'Request body is empty');
      }
      
      body = JSON.parse(rawBody);
    } catch (error) {
      console.error('JSON parsing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return handleApiError(new Error(`Invalid JSON in request body: ${errorMessage}`), 'Invalid request body');
    }
    validateRequestBody(body, ['biaya_pengetahuan', 'pengaruh_kerugian', 'Frekuensi_serangan', 'Pemulihan', 'mengerti_poin']);

    // Convert boolean mengerti_poin to UnderstandLevel enum
    // const understandLevel = body.mengerti_poin ? 'MENGERTI' : 'TIDAK_MENGERTI';

    const inputsRequest: SubmitInputsRequest = {
      biaya_pengetahuan: body.biaya_pengetahuan,
      pengaruh_kerugian: body.pengaruh_kerugian,
      Frekuensi_serangan: body.Frekuensi_serangan,
      Pemulihan: body.Pemulihan,
      mengerti_poin: body.mengerti_poin,
      Tidak_mengerti_poin: body.Tidak_mengerti_poin,
      description_tidak_mengerti: body.description_tidak_mengerti
    };

    // Skip automatic progress update, we'll handle it manually
    const result = await umkmSurveyService.submitInputs(user.id, submissionId, inputsRequest, true);
    
    // Get submission to find assetId
    const submission = await submissionRepository.findById(submissionId);
    if (!submission) {
      return handleApiError(new Error('Submission not found'), 'Submission not found');
    }
    
    // Check if all threats for this asset are now completed
    const completedSubmissions = await db.submission.count({
      where: {
        userId: user.id,
        assetId: submission.assetId,
        score: { isNot: null }
      }
    });
    
    const totalThreats = await db.threat.count({
      where: { assetId: submission.assetId }
    });
    
    // Update progress based on actual completion status
    if (completedSubmissions === totalThreats) {
      // All threats completed
      await formProgressRepository.updateProgress(user.id, submission.assetId, FormStatus.SUBMITTED);
    } else {
      // Some threats still incomplete - keep IN_PROGRESS
      await formProgressRepository.updateProgress(user.id, submission.assetId, FormStatus.IN_PROGRESS);
    }
    
    return createSuccessResponse(result, 'Inputs submitted successfully');

  } catch (error) {
    return handleApiError(error, 'Failed to submit inputs');
  }
}
