import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { jwtService } from '@/lib/jwt';
import { AuthService } from '@/lib/auth-service';
import { UserRepository } from '@/lib/user-repository';
import { passwordService } from '@/lib/password';
import { ThreatDescriptionService } from '@/lib/threat-description-service';
import { 
  handleApiError, 
  createSuccessResponse,
  createAuthErrorResponse
} from '@/lib/error-handler';

// Initialize services with dependency injection
const userRepository = new UserRepository(db);
const authService = new AuthService(userRepository, passwordService, jwtService);
const threatDescriptionService = new ThreatDescriptionService();

/**
 * Get threats for a specific asset with user submission status
 * GET /api/form/assets/[id]/threats
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

    const resolvedParams = await params;
    const assetId = parseInt(resolvedParams.id);
    
    if (isNaN(assetId)) {
      return handleApiError(new Error('Invalid asset ID'), 'Invalid asset ID');
    }

    const asset = await db.asset.findUnique({
      where: { id: assetId },
      include: {
        threats: {
          orderBy: { name: 'asc' },
          include: {
            threatBusinessProcesses: {
              include: {
                businessProcess: { select: { name: true, description: true } }
              }
            }
          }
        }
      }
    });

    if (!asset) {
      return handleApiError(new Error('Asset not found'), 'Asset not found');
    }

    // Get user's submissions for this asset
    const userSubmissions = await db.submission.findMany({
      where: {
        userId: user.id,
        assetId: assetId
      },
      include: {
        threat: {
          select: {
            id: true,
            name: true
          }
        },
        score: true,
        riskInput: true
      }
    });

    // Create a map of submissions by threat ID
    const submissionsByThreat = userSubmissions.reduce((acc, submission) => {
      acc[submission.threatId] = submission;
      return acc;
    }, {} as Record<number, typeof userSubmissions[0]>);

    // Build threats matching FE payload
    const threatsPayload = asset.threats.map(threat => {
      const business_processes = (threat.threatBusinessProcesses || []).map(tb => ({
        name: tb.businessProcess.name,
        explanation: tb.businessProcess.description ?? null
      }));

      return {
        id: threat.id,
        title: threat.name,
        description: threat.description,
        business_processes
      };
    });

    const response = {
      id: asset.id,
      'title-data': asset.name,
      description: asset.description,
      threats: threatsPayload
    };

    return createSuccessResponse(response, 'Threats retrieved successfully');

  } catch (error) {
    return handleApiError(error, 'Failed to retrieve threats');
  }
}
