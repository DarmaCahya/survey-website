import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { AuthService } from '@/lib/auth-service';
import { UserRepository } from '@/lib/user-repository';
import { passwordService } from '@/lib/password';
import { jwtService } from '@/lib/jwt';
import { 
  handleApiError, 
  createSuccessResponse, 
  validateRequestBody 
} from '@/lib/error-handler';
import { RefreshTokenRequest } from '@/types/auth';

// Initialize services with dependency injection
const userRepository = new UserRepository(db);
const authService = new AuthService(userRepository, passwordService, jwtService);

/**
 * Refresh access token using refresh token
 * POST /api/auth/refresh
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    validateRequestBody(body, ['refreshToken']);

    const refreshRequest: RefreshTokenRequest = {
      refreshToken: body.refreshToken,
    };

    const result = await authService.refreshToken(refreshRequest);
    return createSuccessResponse(result.data, 'Token refreshed successfully');
    
  } catch (error) {
    return handleApiError(error, 'Token refresh failed');
  }
}
