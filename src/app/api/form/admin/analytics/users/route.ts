import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { withAdminPin } from '@/lib/admin-pin-service';
import { 
  handleApiError, 
  createSuccessResponse
} from '@/lib/error-handler';

/**
 * Get user-wise analytics
 * GET /api/form/admin/analytics/users
 * Protected with admin PIN
 */
async function getUserAnalytics(_request: NextRequest) {
  try {
    // Get user-wise statistics
    const userStats = await db.user.findMany({
      include: {
        _count: {
          select: {
            submissions: true
          }
        },
        submissions: {
          include: {
            score: true,
            feedback: true
          }
        }
      }
    });

    const userAnalytics = userStats.map(user => {
      const submissions = user.submissions;
      const totalSubmissions = submissions.length;
      const understandStats = {
        mengerti: submissions.filter(s => s.understand === 'MENGERTI').length,
        tidakMengerti: submissions.filter(s => s.understand === 'TIDAK_MENGERTI').length
      };
      const riskStats = {
        LOW: submissions.filter(s => s.score?.category === 'LOW').length,
        MEDIUM: submissions.filter(s => s.score?.category === 'MEDIUM').length,
        HIGH: submissions.filter(s => s.score?.category === 'HIGH').length
      };
      const totalFeedback = submissions.reduce((sum, s) => sum + s.feedback.length, 0);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt
        },
        statistics: {
          totalSubmissions,
          understandStats,
          riskStats,
          totalFeedback,
          averageRiskScore: submissions.length > 0 ? 
            submissions.reduce((sum, s) => sum + (s.score?.total || 0), 0) / submissions.length : 0
        }
      };
    });

    return createSuccessResponse({
      totalUsers: userAnalytics.length,
      users: userAnalytics
    }, 'User analytics retrieved successfully');

  } catch (error) {
    return handleApiError(error, 'Failed to retrieve user analytics');
  }
}

export const GET = withAdminPin(getUserAnalytics);

