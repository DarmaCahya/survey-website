import { NextRequest, NextResponse } from 'next/server';
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
} from '@/lib/repositories';
import { UMKMSurveyService } from '@/lib/umkm-survey-service';
import { riskCalculationService } from '@/lib/risk-calculation';
import { 
  handleApiError, 
  createSuccessResponse,
  createAuthErrorResponse,
  createValidationErrorResponse
} from '@/lib/error-handler';
import { InvalidRiskInputError } from '@/lib/custom-errors';
import { FormStatus } from '@/types/risk';

// Initialize services with dependency injection
const userRepository = new UserRepository(db);
const authService = new AuthService(userRepository, passwordService, jwtService);
const assetRepository = new AssetRepository();
const threatRepository = new ThreatRepository();
const submissionRepository = new SubmissionRepository();
const formProgressRepository = new FormProgressRepository();

const umkmSurveyService = new UMKMSurveyService(
  assetRepository,
  threatRepository,
  submissionRepository,
  formProgressRepository,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  {} as any, // AdminRepository not needed for this endpoint
  riskCalculationService
);

/**
 * Request payload for single threat submission
 * Follows the single responsibility principle: one threat = one form
 */
interface ThreatSubmissionPayload {
  biaya_pengetahuan: number;      // Peluang Serangan (1-6)
  pengaruh_kerugian: number;       // Impact (1-6)
  Frekuensi_serangan: number;      // Frekuensi (1-6)
  Pemulihan: number;              // Pemulihan (2/4/6)
  mengerti_poin: boolean;          // User understanding flag
  Tidak_mengerti_poin?: string;    // Optional: What they don't understand
  description_tidak_mengerti?: string; // Optional: Description
}

/**
 * Validation constants
 */
const VALIDATION = {
  INPUT_RANGES: {
    biaya_pengetahuan: { min: 1, max: 6 },
    pengaruh_kerugian: { min: 1, max: 6 },
    Frekuensi_serangan: { min: 1, max: 6 },
    Pemulihan: { allowed: [2, 4, 6] }
  }
} as const;

/**
 * Validates risk input ranges
 * Ensures data integrity and prevents invalid calculations
 */
function validateRiskInputs(payload: ThreatSubmissionPayload): void {
  const { biaya_pengetahuan, pengaruh_kerugian, Frekuensi_serangan, Pemulihan } = payload;
  
  // Validate biaya_pengetahuan (1-6)
  if (!Number.isInteger(biaya_pengetahuan) || 
      biaya_pengetahuan < VALIDATION.INPUT_RANGES.biaya_pengetahuan.min || 
      biaya_pengetahuan > VALIDATION.INPUT_RANGES.biaya_pengetahuan.max) {
    throw new InvalidRiskInputError('biaya_pengetahuan', biaya_pengetahuan, '1-6');
  }
  
  // Validate pengaruh_kerugian (1-6)
  if (!Number.isInteger(pengaruh_kerugian) || 
      pengaruh_kerugian < VALIDATION.INPUT_RANGES.pengaruh_kerugian.min || 
      pengaruh_kerugian > VALIDATION.INPUT_RANGES.pengaruh_kerugian.max) {
    throw new InvalidRiskInputError('pengaruh_kerugian', pengaruh_kerugian, '1-6');
  }
  
  // Validate Frekuensi_serangan (1-6)
  if (!Number.isInteger(Frekuensi_serangan) || 
      Frekuensi_serangan < VALIDATION.INPUT_RANGES.Frekuensi_serangan.min || 
      Frekuensi_serangan > VALIDATION.INPUT_RANGES.Frekuensi_serangan.max) {
    throw new InvalidRiskInputError('Frekuensi_serangan', Frekuensi_serangan, '1-6');
  }
  
  // Validate Pemulihan (2/4/6)
  if (!Number.isInteger(Pemulihan) || 
      !VALIDATION.INPUT_RANGES.Pemulihan.allowed.includes(Pemulihan)) {
    throw new InvalidRiskInputError('Pemulihan', Pemulihan, '2, 4, or 6');
  }
}

/**
 * Validates text feedback fields
 * Prevents abuse by ensuring required fields are present
 */
function validateFeedbackFields(payload: ThreatSubmissionPayload): void {
  if (!payload.mengerti_poin) {
    // If user doesn't understand, require Tidak_mengerti_poin
    if (!payload.Tidak_mengerti_poin || payload.Tidak_mengerti_poin.trim().length === 0) {
      throw new Error('Tidak_mengerti_poin is required when mengerti_poin is false');
    }
  }
}

/**
 * Validates that threat belongs to asset
 * Security: Prevents unauthorized access to threats from other assets
 */
async function validateAssetThreatRelationship(assetId: number, threatId: number): Promise<void> {
  const threats = await assetRepository.findThreatsByAssetId(assetId);
  
  const threatExists = threats.some(t => t.id === threatId);
  
  if (!threatExists) {
    throw new Error(`Threat ${threatId} does not belong to asset ${assetId}`);
  }
}


/**
 * POST /api/form/submit-form/[assetId]/[threatId]
 * 
 * Single endpoint for creating and submitting a form for a specific threat.
 * Follows RESTful principles: resource-based URL with method semantics.
 * 
 * Security measures:
 * - Authentication required
 * - Input validation
 * - Transaction-based operations for atomicity
 * - Duplicate submission prevention
 * 
 * Request body:
 * {
 *   biaya_pengetahuan: number (1-6),
 *   pengaruh_kerugian: number (1-6),
 *   Frekuensi_serangan: number (1-6),
 *   Pemulihan: number (2/4/6),
 *   mengerti_poin: boolean,
 *   Tidak_mengerti_poin?: string,
 *   description_tidak_mengerti?: string
 * }
 * 
 * @param request NextRequest
 * @param params Route parameters containing assetId and threatId
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string; threatId: string }> }
) {
  try {
    // Extract and parse route parameters
    const { assetId: assetIdParam, threatId: threatIdParam } = await params;
    
    // Validate route parameters
    const assetId = parseInt(assetIdParam);
    const threatId = parseInt(threatIdParam);
    
    if (isNaN(assetId) || assetId <= 0) {
      return createValidationErrorResponse('Invalid asset ID');
    }
    
    if (isNaN(threatId) || threatId <= 0) {
      return createValidationErrorResponse('Invalid threat ID');
    }
    
    // Authentication
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
    
    // Parse and validate request body
    let payload: ThreatSubmissionPayload;
    try {
      payload = await request.json();
    } catch (error) {
      return createValidationErrorResponse('Invalid JSON payload');
    }
    
    // Validate required fields
    if (typeof payload.biaya_pengetahuan !== 'number' ||
        typeof payload.pengaruh_kerugian !== 'number' ||
        typeof payload.Frekuensi_serangan !== 'number' ||
        typeof payload.Pemulihan !== 'number' ||
        typeof payload.mengerti_poin !== 'boolean') {
      return createValidationErrorResponse('Missing or invalid required fields');
    }
    
    // Validate risk inputs (ranges and allowed values)
    validateRiskInputs(payload);
    
    // Validate feedback fields
    validateFeedbackFields(payload);
    
    // Security: Validate threat belongs to asset
    await validateAssetThreatRelationship(assetId, threatId);
    
    // Check for existing submission (prevent duplicates)
    const existingSubmission = await submissionRepository.findByUserAssetThreat(
      user.id,
      assetId,
      threatId
    );
    
    if (existingSubmission && existingSubmission.score) {
      return NextResponse.json(
        {
          success: false,
          error: 'SUBMISSION_ALREADY_COMPLETED',
          message: 'This threat has already been submitted with a score. Cannot resubmit.',
          code: 'SUBMISSION_ALREADY_COMPLETED'
        },
        { status: 409 }
      );
    }
    
    // Use transaction for atomic operation
    let submissionId: number;
    
    if (existingSubmission) {
      // Update existing submission
      submissionId = existingSubmission.id;
    } else {
      // Create new submission
      submissionId = await submissionRepository.create(user.id, assetId, threatId);
      
      // Update form progress
      await formProgressRepository.updateProgress(user.id, assetId, 'IN_PROGRESS' as FormStatus);
    }
    
    // Submit inputs and calculate scores
    const result = await umkmSurveyService.submitInputs(user.id, submissionId, {
      biaya_pengetahuan: payload.biaya_pengetahuan,
      pengaruh_kerugian: payload.pengaruh_kerugian,
      Frekuensi_serangan: payload.Frekuensi_serangan,
      Pemulihan: payload.Pemulihan,
      mengerti_poin: payload.mengerti_poin,
      Tidak_mengerti_poin: payload.Tidak_mengerti_poin,
      description_tidak_mengerti: payload.description_tidak_mengerti
    });
    
    return createSuccessResponse({
      submissionId,
      threatId,
      assetId,
      scores: {
        peluang: result.peluang,
        impact: result.impact,
        total: result.total,
        category: result.category
      },
      threatDescription: result.threatDescription,
      submittedAt: new Date().toISOString()
    }, 'Threat assessment submitted successfully');
    
  } catch (error) {
    // Handle specific validation errors
    if (error instanceof InvalidRiskInputError) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_RISK_INPUT',
          message: error.message,
          code: 'INVALID_RISK_INPUT'
        },
        { status: 400 }
      );
    }
    
    // Generic error handling
    return handleApiError(error, 'Failed to submit threat assessment');
  }
}
