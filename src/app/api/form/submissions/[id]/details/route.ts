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
      threatDescription: sanitizeThreatDescription(submission.score?.threatDescription, submission.threat.name, submission.score?.category),

      // Additional feedback if any
      feedback: submission.feedback.length > 0 ? submission.feedback : null
    };

    return createSuccessResponse(detailedResponse, 'Submission details retrieved successfully');

  } catch (error) {
    return handleApiError(error, 'Failed to retrieve submission details');
  }
}

// Sanitize and type threatDescription JSON
type RiskCategory = 'LOW' | 'MEDIUM' | 'HIGH';
interface SanitizedThreatDescription {
  threatName: string;
  recommendations: string[];
  priority: RiskCategory;
  actionRequired: boolean;
  category: RiskCategory;
}

function sanitizeThreatDescription(
  input: unknown,
  fallbackThreatName: string,
  fallbackCategory?: string | null
): SanitizedThreatDescription | null {
  if (!input || typeof input !== 'object') return null;
  const obj = input as Record<string, unknown>;
  const threatName = typeof obj.threatName === 'string' ? obj.threatName : fallbackThreatName;
  const recommendations = Array.isArray(obj.recommendations)
    ? (obj.recommendations.filter((r) => typeof r === 'string') as string[])
    : [];
  const priority = (obj.priority as RiskCategory) ?? 'LOW';
  const actionRequired = typeof obj.actionRequired === 'boolean' ? obj.actionRequired : false;
  const category = ((obj.category as RiskCategory) ?? (fallbackCategory as RiskCategory) ?? 'LOW');
  return { threatName, recommendations, priority, actionRequired, category };
}
