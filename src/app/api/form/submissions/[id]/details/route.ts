import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { jwtService } from '@/lib/jwt';
import { AuthService } from '@/lib/auth-service';
import { UserRepository } from '@/lib/user-repository';
import { passwordService } from '@/lib/password';
import { 
  handleApiError, 
  createSuccessResponse,
  createAuthErrorResponse
} from '@/lib/error-handler';

// Initialize services
const userRepository = new UserRepository(db);
const authService = new AuthService(userRepository, passwordService, jwtService);

/**
 * Get detailed submission with question tracking
 * GET /api/form/submissions/[id]/details
 */
export async function GET(
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

    // Ensure user.id is valid and properly typed
    if (!user.id || typeof user.id !== 'number' || user.id <= 0) {
      console.error('Invalid user ID:', user.id);
      return createAuthErrorResponse('Invalid user ID');
    }

    // Await params for Next.js 15 compatibility
    const resolvedParams = await params;
    
    // Validate submission ID
    const submissionId = parseInt(resolvedParams.id);
    if (isNaN(submissionId)) {
      return handleApiError(new Error('Invalid submission ID'), 'Invalid submission ID');
    }

    // Get submission with related data (no riskInput/description in selects)
    const submission = await db.submission.findUnique({
      where: { id: submissionId },
      include: {
        score: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        asset: {
          select: {
            id: true,
            name: true
          }
        },
        threat: {
          select: {
            id: true,
            name: true
          }
        },
        feedback: {
          select: {
            id: true,
            field: true,
            message: true,
            createdAt: true
          }
        }
      }
    });

    if (!submission) {
      return handleApiError(new Error('Submission not found'), 'Submission not found');
    }

    // Check ownership
    if (submission.userId !== user.id) {
      return createAuthErrorResponse('Unauthorized access to submission');
    }

    // Construct clean and organized response (no answers/description)
    const detailedResponse = {
      // Basic submission info
      id: submission.id,
      submittedAt: submission.submittedAt,
      status: submission.score ? 'COMPLETED' : 'IN_PROGRESS',
      
      // User context
      user: {
        id: submission.user.id,
        email: submission.user.email,
        name: submission.user.name
      },
      
      // Asset and threat context
      asset: {
        id: submission.asset.id,
        name: submission.asset.name
      },
      
      threat: {
        id: submission.threat.id,
        name: submission.threat.name
      },
      
      // No risk assessment answers in response
      
      // Calculated risk scores
      riskScore: submission.score ? {
        peluang: submission.score.peluang,
        impact: submission.score.impact,
        total: submission.score.total,
        category: submission.score.category
      } : null,
      
      // Sanitized threatDescription (no description text)
      threatDescription: submission.score?.threatDescription ? {
        threatName: (submission.score.threatDescription as any).threatName,
        recommendations: (submission.score.threatDescription as any).recommendations,
        priority: (submission.score.threatDescription as any).priority,
        actionRequired: (submission.score.threatDescription as any).actionRequired,
        category: (submission.score.threatDescription as any).category
      } : null,

      // Additional feedback if any
      feedback: submission.feedback.length > 0 ? submission.feedback : null
    };

    return createSuccessResponse(detailedResponse, 'Submission details retrieved successfully');

  } catch (error) {
    return handleApiError(error, 'Failed to retrieve submission details');
  }
}

// Helper functions to provide meaning for each answer
function getBiayaPengetahuanMeaning(value: number): string {
  const meanings = {
    1: "Sangat Rendah - Biaya dan pengetahuan minimal",
    2: "Rendah - Biaya dan pengetahuan kecil",
    3: "Sedang - Biaya dan pengetahuan sedang",
    4: "Tinggi - Biaya dan pengetahuan besar",
    5: "Sangat Tinggi - Biaya dan pengetahuan sangat besar",
    6: "Kritis - Biaya dan pengetahuan maksimal"
  };
  return meanings[value as keyof typeof meanings] || "Unknown";
}

function getPengaruhKerugianMeaning(value: number): string {
  const meanings = {
    1: "Minimal - Pengaruh dan kerugian sangat kecil",
    2: "Kecil - Pengaruh dan kerugian kecil",
    3: "Sedang - Pengaruh dan kerugian sedang",
    4: "Besar - Pengaruh dan kerugian besar",
    5: "Sangat Besar - Pengaruh dan kerugian sangat besar",
    6: "Kritis - Pengaruh dan kerugian maksimal"
  };
  return meanings[value as keyof typeof meanings] || "Unknown";
}

function getFrekuensiSeranganMeaning(value: number): string {
  const meanings = {
    1: "Jarang Sekali - Hampir tidak pernah terjadi",
    2: "Jarang - Jarang terjadi",
    3: "Kadang-kadang - Kadang terjadi",
    4: "Sering - Sering terjadi",
    5: "Sangat Sering - Sangat sering terjadi",
    6: "Terus Menerus - Terus menerus terjadi"
  };
  return meanings[value as keyof typeof meanings] || "Unknown";
}

function getPemulihanMeaning(value: number): string {
  const meanings = {
    2: "Cepat Pulih - Bisa pulih dalam waktu singkat",
    4: "Sedang Pulih - Butuh waktu sedang untuk pulih",
    6: "Lambat Pulih - Butuh waktu lama untuk pulih"
  };
  return meanings[value as keyof typeof meanings] || "Unknown";
}

function getRiskCategoryInterpretation(category: string): string {
  const interpretations = {
    'LOW': 'Risiko Rendah - Ancaman dapat dikelola dengan mudah',
    'MEDIUM': 'Risiko Sedang - Perlu perhatian dan monitoring',
    'HIGH': 'Risiko Tinggi - Memerlukan tindakan segera dan prioritas tinggi'
  };
  return interpretations[category as keyof typeof interpretations] || "Unknown";
}
