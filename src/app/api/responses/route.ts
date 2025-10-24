import { NextRequest } from "next/server";
import { db } from "@/lib/database";
import { jwtService } from "@/lib/jwt";
import { AuthService } from "@/lib/auth-service";
import { UserRepository } from "@/lib/user-repository";
import { passwordService } from "@/lib/password";
import { handleApiError, createSuccessResponse, createAuthErrorResponse } from "@/lib/error-handler";

// Initialize services with dependency injection
const userRepository = new UserRepository(db);
const authService = new AuthService(userRepository, passwordService, jwtService);

/**
 * Get all survey responses (protected route)
 * GET /api/responses
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

        const responses = await db.response.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });

        return createSuccessResponse(responses, 'Responses fetched successfully');
    } catch (error) {
        return handleApiError(error, 'Failed to fetch responses');
    }
}