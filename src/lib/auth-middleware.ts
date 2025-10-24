import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { AuthService } from '@/lib/auth-service';
import { UserRepository } from '@/lib/user-repository';
import { passwordService } from '@/lib/password';
import { jwtService } from '@/lib/jwt';
import { AuthUser } from '@/types/auth';
import { createAuthErrorResponse } from '@/lib/error-handler';

// Initialize services with dependency injection
const userRepository = new UserRepository(db);
const authService = new AuthService(userRepository, passwordService, jwtService);

// Extend NextRequest to include user
interface AuthenticatedRequest extends NextRequest {
  user?: AuthUser;
}

/**
 * Authentication middleware for protecting API routes
 * Follows SOLID principles - Single Responsibility Principle
 */
export async function withAuth(
  handler: (request: NextRequest, user: AuthUser | null) => Promise<NextResponse>,
  options: { required: boolean } = { required: true }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader) {
        if (options.required) {
          return createAuthErrorResponse('Authorization header is required');
        }
        // For optional auth, continue without user
        return handler(request, null);
      }

      const token = jwtService.extractTokenFromHeader(authHeader);
      if (!token) {
        if (options.required) {
          return createAuthErrorResponse('Invalid authorization header format');
        }
        return handler(request, null);
      }

      const user = await authService.validateToken(token);
      if (!user) {
        if (options.required) {
          return createAuthErrorResponse('Invalid or expired token');
        }
        return handler(request, null);
      }

      // Add user to request context
      (request as AuthenticatedRequest).user = user;
      
      return handler(request, user);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return createAuthErrorResponse('Authentication failed');
    }
  };
}

/**
 * Higher-order function to protect API routes
 * @param handler - API route handler function
 * @param options - Authentication options
 * @returns Protected API route handler
 */
export function protectRoute(
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>,
  options: { required: boolean } = { required: true }
) {
  return withAuth(handler, options);
}

/**
 * Extract user from request (for use in API routes)
 * @param request - NextRequest object
 * @returns AuthUser or null
 */
export function getUserFromRequest(request: NextRequest): AuthUser | null {
  return (request as AuthenticatedRequest).user || null;
}

/**
 * Check if user has required permissions
 * @param user - AuthUser object
 * @param _permission - Required permission (currently unused)
 * @returns True if user has permission
 */
export function hasPermission(user: AuthUser, _permission: string): boolean {
  // Basic implementation - can be extended based on your needs
  if (!user || !user.isActive) {
    return false;
  }

  // For now, all active users have all permissions
  // You can implement role-based permissions here
  return true;
}

/**
 * Middleware to check user permissions
 * @param permission - Required permission
 * @returns Middleware function
 */
export function requirePermission(permission: string) {
  return (handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>) => {
    return async (request: NextRequest, user: AuthUser): Promise<NextResponse> => {
      if (!hasPermission(user, permission)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSIONS',
          },
          { status: 403 }
        );
      }

      return handler(request, user);
    };
  };
}
