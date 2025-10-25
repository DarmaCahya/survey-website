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
import { CreateSubmissionRequest, BatchSubmissionRequest } from '@/types/risk';
import { Prisma } from '@prisma/client';

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
 * Get all submissions with detailed feedback
 * GET /api/form/submissions
 */
export async function GET(request: NextRequest) {
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');
    const threatId = searchParams.get('threatId');
    const understandLevel = searchParams.get('understandLevel');
    const includeFeedback = searchParams.get('includeFeedback') === 'true';

    // Build where clause
    const whereClause: Prisma.SubmissionWhereInput = { userId: user.id };
    if (assetId) whereClause.assetId = parseInt(assetId);
    if (threatId) whereClause.threatId = parseInt(threatId);
    if (understandLevel) whereClause.understand = understandLevel as 'MENGERTI' | 'TIDAK_MENGERTI';

    // Get submissions with all related data
    const submissions = await db.submission.findMany({
      where: whereClause,
      include: {
        riskInput: true,
        score: true,
        asset: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        threat: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        feedback: {
          select: {
            id: true,
            field: true,
            message: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    // Transform submissions to include detailed feedback analysis
    const submissionsWithFeedback = submissions.map(submission => {
      // Analyze feedback by type
      const feedbackAnalysis = {
        mengertiPoin: submission.feedback.filter(f => f.field === 'mengerti_poin'),
        tidakMengertiPoin: submission.feedback.filter(f => f.field === 'Tidak_mengerti_poin'),
        descriptionTidakMengerti: submission.feedback.filter(f => f.field === 'description_tidak_mengerti'),
        otherFeedback: submission.feedback.filter(f => 
          !['mengerti_poin', 'Tidak_mengerti_poin', 'description_tidak_mengerti'].includes(f.field)
        )
      };

      // Get understanding details
      const understandingDetails = {
        level: submission.understand,
        isUnderstood: submission.understand === 'MENGERTI',
        feedback: {
          // Feedback dari pertanyaan "Apakah anda mengerti tentang poin ini?"
          understandingQuestion: feedbackAnalysis.mengertiPoin.map(f => ({
            id: f.id,
            message: f.message,
            createdAt: f.createdAt
          })),
          
          // Feedback dari dropdown "Jika tidak mengerti, apa yang tidak anda mengerti?"
          notUnderstoodTopic: feedbackAnalysis.tidakMengertiPoin.map(f => ({
            id: f.id,
            topic: f.message, // e.g., "Frekuensi Serangan"
            createdAt: f.createdAt
          })),
          
          // Feedback dari textarea "Penjelasan tentang hal yang tidak dimengerti"
          explanation: feedbackAnalysis.descriptionTidakMengerti.map(f => ({
            id: f.id,
            explanation: f.message, // e.g., "sdfsdfsd"
            createdAt: f.createdAt
          })),
          
          // Other feedback
          other: feedbackAnalysis.otherFeedback.map(f => ({
            id: f.id,
            field: f.field,
            message: f.message,
            createdAt: f.createdAt
          }))
        }
      };

      return {
        id: submission.id,
        assetId: submission.assetId,
        threatId: submission.threatId,
        submittedAt: submission.submittedAt,
        understand: submission.understand,
        
        // Asset and threat context
        asset: submission.asset,
        threat: submission.threat,
        
        // Risk assessment data
        riskInput: submission.riskInput ? {
          biaya_pengetahuan: submission.riskInput.f,
          pengaruh_kerugian: submission.riskInput.g,
          frekuensi_serangan: submission.riskInput.h,
          pemulihan: submission.riskInput.i
        } : null,
        
        // Calculated scores
        score: submission.score ? {
          peluang: submission.score.peluang,
          impact: submission.score.impact,
          total: submission.score.total,
          category: submission.score.category,
          threatDescription: submission.score.threatDescription
        } : null,
        
        // Detailed understanding analysis
        understandingDetails,
        
        // All feedback (if requested)
        feedback: includeFeedback ? submission.feedback : undefined,
        
        // Status
        status: submission.score ? 'COMPLETED' : 'IN_PROGRESS'
      };
    });

    // Get summary statistics
    const summary = {
      totalSubmissions: submissions.length,
      completedSubmissions: submissions.filter(s => s.score).length,
      inProgressSubmissions: submissions.filter(s => !s.score).length,
      understandingStats: {
        mengerti: submissions.filter(s => s.understand === 'MENGERTI').length,
        tidakMengerti: submissions.filter(s => s.understand === 'TIDAK_MENGERTI').length
      },
      feedbackStats: {
        totalFeedback: submissions.reduce((sum, s) => sum + s.feedback.length, 0),
        feedbackByType: {
          mengertiPoin: submissions.reduce((sum, s) => 
            sum + s.feedback.filter(f => f.field === 'mengerti_poin').length, 0),
          tidakMengertiPoin: submissions.reduce((sum, s) => 
            sum + s.feedback.filter(f => f.field === 'Tidak_mengerti_poin').length, 0),
          descriptionTidakMengerti: submissions.reduce((sum, s) => 
            sum + s.feedback.filter(f => f.field === 'description_tidak_mengerti').length, 0)
        }
      }
    };

    return createSuccessResponse({
      summary,
      submissions: submissionsWithFeedback,
      filters: {
        assetId,
        threatId,
        understandLevel,
        includeFeedback
      }
    }, 'Submissions retrieved successfully');

  } catch (error) {
    return handleApiError(error, 'Failed to retrieve submissions');
  }
}

/**
 * Create a new submission
 * POST /api/form/submissions
 */
export async function POST(request: NextRequest) {
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

    // Validate request body
    const body = await request.json();
    
    // Check if this is a batch submission (has 'threats' array) or single submission
    if (body.threats && Array.isArray(body.threats)) {
      // Batch submission
      validateRequestBody(body, ['assetId', 'threats']);
      
      const batchRequest: BatchSubmissionRequest = {
        assetId: body.assetId,
        threats: body.threats
      };

      const result = await umkmSurveyService.createBatchSubmission(user.id, batchRequest);
      return createSuccessResponse(result, 'Batch submissions created successfully');
    } else {
      // Single submission (backward compatibility)
      validateRequestBody(body, ['assetId', 'threatId']);
      
      const submissionRequest: CreateSubmissionRequest = {
        assetId: body.assetId,
        threatId: body.threatId
      };

      const result = await umkmSurveyService.createSubmission(user.id, submissionRequest);
      return createSuccessResponse(result, 'Submission created successfully');
    }

  } catch (error) {
    return handleApiError(error, 'Failed to create submission');
  }
}
