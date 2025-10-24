import { NextRequest } from "next/server";
import { db } from "@/lib/database";
import { jwtService } from "@/lib/jwt";
import { AuthService } from "@/lib/auth-service";
import { UserRepository } from "@/lib/user-repository";
import { passwordService } from "@/lib/password";
import { UserProgressService } from "@/lib/user-progress-service";
import { handleApiError, createSuccessResponse, createAuthErrorResponse } from "@/lib/error-handler";

// Initialize services with dependency injection
const userRepository = new UserRepository(db);
const authService = new AuthService(userRepository, passwordService, jwtService);
const userProgressService = new UserProgressService();

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

        // Get detailed user progress
        const detailedProgress = await userProgressService.getUserProgress(user.id);

        // Get all users progress for admin view
        const allUsersProgress = await userProgressService.getAllUsersProgress();

        // Get survey responses (legacy data)
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

        return createSuccessResponse({
            // Current user's detailed progress
            userProgress: {
                userId: user.id,
                userEmail: user.email,
                userName: user.name,
                progress: detailedProgress
            },
            // All users progress summary (admin view)
            allUsersProgress,
            // Legacy survey responses
            legacyResponses: responses,
            // Summary statistics
            summary: {
                totalUsers: allUsersProgress.length,
                totalAssets: detailedProgress.totalAssets,
                averageProgress: allUsersProgress.length > 0 
                    ? Math.round(allUsersProgress.reduce((sum, u) => sum + u.progress.progressPercentage, 0) / allUsersProgress.length)
                    : 0,
                usersCompleted: allUsersProgress.filter(u => u.progress.progressPercentage === 100).length,
                usersInProgress: allUsersProgress.filter(u => u.progress.progressPercentage > 0 && u.progress.progressPercentage < 100).length,
                usersNotStarted: allUsersProgress.filter(u => u.progress.progressPercentage === 0).length
            }
        }, 'Survey progress and responses fetched successfully');
    } catch (error) {
        return handleApiError(error, 'Failed to fetch responses');
    }
}