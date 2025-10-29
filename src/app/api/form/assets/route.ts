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

// Initialize services with dependency injection
const userRepository = new UserRepository(db);
const authService = new AuthService(userRepository, passwordService, jwtService);

/**
 * Get all assets with threat counts, descriptions, and user progress status
 * GET /api/form/assets
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

    // Get all assets with descriptions
    const assets = await db.asset.findMany({
      include: {
        threats: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Get user's submissions for all assets
    const userSubmissions = await db.submission.findMany({
      where: {
        userId: user.id
      },
      include: {
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
        score: true
      }
    });

    // Group submissions by asset
    const submissionsByAsset = userSubmissions.reduce((acc, submission) => {
      const assetId = submission.assetId;
      if (!acc[assetId]) {
        acc[assetId] = [];
      }
      acc[assetId].push(submission);
      return acc;
    }, {} as Record<number, typeof userSubmissions>);

    // Build response with status
    const assetsWithStatus = assets.map(asset => {
      const assetSubmissions = submissionsByAsset[asset.id] || [];
      const totalThreats = asset.threats.length;
      const completedThreats = assetSubmissions.filter(s => s.score).length;
      
      let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
      if (completedThreats === 0) {
        status = 'NOT_STARTED';
      } else if (completedThreats === totalThreats) {
        status = 'COMPLETED';
      } else {
        status = 'IN_PROGRESS'; // Partial completion
      }

      return {
        id: asset.id,
        name: asset.name,
        description: asset.description,
        threatCount: totalThreats,
        status,
        progress: {
          total: totalThreats,
          completed: completedThreats,
          inProgress: assetSubmissions.filter(s => !s.score).length,
          notStarted: totalThreats - assetSubmissions.length
        },
        threats: asset.threats.map(threat => ({
          id: threat.id,
          name: threat.name
        }))
      };
    });

    return createSuccessResponse(assetsWithStatus, 'Assets retrieved successfully');

  } catch (error) {
    return handleApiError(error, 'Failed to retrieve assets');
  }
}
