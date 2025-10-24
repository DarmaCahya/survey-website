import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { AuthService } from '@/lib/auth-service';
import { UserRepository } from '@/lib/user-repository';
import { passwordService } from '@/lib/password';
import { jwtService } from '@/lib/jwt';
import { 
  handleApiError, 
  createSuccessResponse,
  createAuthErrorResponse 
} from '@/lib/error-handler';

// Initialize services with dependency injection
const userRepository = new UserRepository(db);
const authService = new AuthService(userRepository, passwordService, jwtService);

/**
 * Logout user (protected route)
 * POST /api/auth/logout
 */
export async function POST(request: NextRequest) {
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

    const result = await authService.logout(user.id);
    return createSuccessResponse(result, result.message);
    
  } catch (error) {
    return handleApiError(error, 'Logout failed');
  }
}
