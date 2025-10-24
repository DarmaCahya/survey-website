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
import { RegisterRequest } from '@/types/auth';

// Initialize services with dependency injection
const userRepository = new UserRepository(db);
const authService = new AuthService(userRepository, passwordService, jwtService);

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    validateRequestBody(body, ['email', 'password']);

    const registerRequest: RegisterRequest = {
      email: body.email,
      password: body.password,
      name: body.name,
    };

    const result = await authService.register(registerRequest);
    return createSuccessResponse(result.data, 'User registered successfully');
    
  } catch (error) {
    return handleApiError(error, 'Registration failed');
  }
}
