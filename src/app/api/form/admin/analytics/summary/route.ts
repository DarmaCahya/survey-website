import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { withAdminPin } from '@/lib/admin-pin-service';
import { 
  handleApiError, 
  createSuccessResponse
} from '@/lib/error-handler';

/**
 * Get analytics summary statistics
 * GET /api/form/admin/analytics/summary
 * Protected with admin PIN
 */
async function getSummaryAnalytics(_request: NextRequest) {
  try {
    // Get all submissions for aggregation
    const allSubmissions = await db.submission.findMany({
      select: {
        userId: true,
        understand: true,
        assetId: true,
        threatId: true,
        score: {
          select: {
            total: true,
            category: true,
            peluang: true,
            impact: true
          }
        },
        feedback: true
      }
    });

    const totalSubmissions = allSubmissions.length;
    const understandStats = {
      mengerti: allSubmissions.filter(s => s.understand === 'MENGERTI').length,
      tidakMengerti: allSubmissions.filter(s => s.understand === 'TIDAK_MENGERTI').length,
      total: allSubmissions.length
    };

    const riskCategoryStats = {
      LOW: allSubmissions.filter(s => s.score?.category === 'LOW').length,
      MEDIUM: allSubmissions.filter(s => s.score?.category === 'MEDIUM').length,
      HIGH: allSubmissions.filter(s => s.score?.category === 'HIGH').length,
      none: allSubmissions.filter(s => !s.score).length
    };

    // Feedback statistics
    const feedbackStats = {
      totalFeedback: allSubmissions.reduce((sum, s) => sum + s.feedback.length, 0),
      feedbackByField: {} as Record<string, number>
    };

    allSubmissions.forEach(submission => {
      submission.feedback.forEach(feedback => {
        feedbackStats.feedbackByField[feedback.field] = 
          (feedbackStats.feedbackByField[feedback.field] || 0) + 1;
      });
    });

    const avgRiskScore = allSubmissions.length > 0
      ? allSubmissions.reduce((sum, s) => sum + (s.score?.total || 0), 0) / allSubmissions.length
      : 0;

    const avgPeluang = allSubmissions.length > 0
      ? allSubmissions.reduce((sum, s) => sum + (s.score?.peluang || 0), 0) / allSubmissions.length
      : 0;

    const avgImpact = allSubmissions.length > 0
      ? allSubmissions.reduce((sum, s) => sum + (s.score?.impact || 0), 0) / allSubmissions.length
      : 0;

    return createSuccessResponse({
      summary: {
        totalSubmissions,
        totalUsers: new Set(allSubmissions.map(s => s.userId)).size,
        understandStats,
        riskCategoryStats,
        feedbackStats: {
          totalFeedback: feedbackStats.totalFeedback,
          feedbackByField: feedbackStats.feedbackByField,
          mostCommonFields: Object.entries(feedbackStats.feedbackByField)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([field, count]) => ({ field, count }))
        },
        averageScores: {
          riskScore: Math.round(avgRiskScore * 100) / 100,
          peluang: Math.round(avgPeluang * 100) / 100,
          impact: Math.round(avgImpact * 100) / 100
        }
      }
    }, 'Summary analytics retrieved successfully');

  } catch (error) {
    return handleApiError(error, 'Failed to retrieve summary analytics');
  }
}

export const GET = withAdminPin(getSummaryAnalytics);

