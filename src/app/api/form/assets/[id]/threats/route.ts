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

    // Get asset with threats
    const asset = await db.asset.findUnique({
      where: { id: assetId },
      include: {
        threats: {
          orderBy: {
            name: 'asc'
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

    // Build threats with status
    const threatsWithStatus = asset.threats.map(threat => {
      const submission = submissionsByThreat[threat.id];
      
      let status: 'NOT_STARTED' | 'COMPLETED';
      let submissionData = null;

      if (!submission || !submission.score) {
        status = 'NOT_STARTED';
      } else {
        status = 'COMPLETED';
        
        const threatDescription = threatDescriptionService.generateThreatDescription(
          threat.name,
          submission.score.category
        );
        
        submissionData = {
          submissionId: submission.id,
          understand: submission.understand,
          riskInput: submission.riskInput ? {
            biaya_pengetahuan: submission.riskInput.f,
            pengaruh_kerugian: submission.riskInput.g,
            frekuensi_serangan: submission.riskInput.h,
            pemulihan: submission.riskInput.i
          } : null,
          score: {
            peluang: submission.score.peluang,
            impact: submission.score.impact,
            total: submission.score.total,
            category: submission.score.category
          },
          threatDescription
        };
      }

      return {
        id: threat.id,
        name: threat.name,
        description: threat.description,
        status,
        submission: submissionData
      };
    });

    const response = {
      asset: {
        id: asset.id,
        name: asset.name,
        description: asset.description
      },
      threats: threatsWithStatus,
      summary: {
        total: asset.threats.length,
        completed: threatsWithStatus.filter(t => t.status === 'COMPLETED').length,
        notStarted: threatsWithStatus.filter(t => t.status === 'NOT_STARTED').length
      }
    };

    return createSuccessResponse(response, 'Threats retrieved successfully');

  } catch (error) {
    return handleApiError(error, 'Failed to retrieve threats');
  }
}
