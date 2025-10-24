import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { AuthService } from '@/lib/auth-service';
import { UserRepository } from '@/lib/user-repository';
import { passwordService } from '@/lib/password';
import { jwtService } from '@/lib/jwt';
import { UserProgressService } from '@/lib/user-progress-service';
import { 
  handleApiError, 
  createSuccessResponse,
  createAuthErrorResponse 
} from '@/lib/error-handler';

// Initialize services with dependency injection
const userRepository = new UserRepository(db);
const authService = new AuthService(userRepository, passwordService, jwtService);
const userProgressService = new UserProgressService();

/**
 * Verify token and get user info
 * GET /api/auth/verify
 */
export async function GET(request: NextRequest) {
  try {
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

    // Get user progress summary
    const progress = await userProgressService.getUserProgressSummary(user.id);

    return createSuccessResponse({ 
      user,
      progress: {
        totalAssets: progress.totalAssets,
        completedAssets: progress.completedAssets,
        inProgressAssets: progress.inProgressAssets,
        notStartedAssets: progress.notStartedAssets,
        progressPercentage: progress.progressPercentage,
        remainingForms: progress.notStartedAssets + progress.inProgressAssets
      }
    }, 'Token verified successfully');
    
  } catch (error) {
    return handleApiError(error, 'Token verification failed');
  }
}
