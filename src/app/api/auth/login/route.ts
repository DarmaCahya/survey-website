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
import { LoginRequest } from '@/types/auth';

// Initialize services with dependency injection
const userRepository = new UserRepository(db);
const authService = new AuthService(userRepository, passwordService, jwtService);

/**
 * Login user
 * POST /api/auth/login
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    validateRequestBody(body, ['email', 'password']);

    const loginRequest: LoginRequest = {
      email: body.email,
      password: body.password,
    };

    const result = await authService.login(loginRequest);
    return createSuccessResponse(result.data, 'Login successful');
    
  } catch (error) {
    return handleApiError(error, 'Login failed');
  }
}
