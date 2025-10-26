import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { withAdminPin } from '@/lib/admin-pin-service';
import { 
  handleApiError, 
  createSuccessResponse
} from '@/lib/error-handler';

/**
 * Get comprehensive analytics including user feedback
 * GET /api/form/admin/analytics
 * Protected with admin PIN
 */
async function getAnalytics(_request: NextRequest) {
  try {
    // Get all submissions with minimal data for aggregation
    const allSubmissions = await db.submission.findMany({
      select: {
        id: true,
        userId: true,
        assetId: true,
        threatId: true,
        understand: true,
        submittedAt: true,
        riskInput: {
          select: {
            f: true,
            g: true,
            h: true,
            i: true
          }
        },
        score: {
          select: {
            peluang: true,
            impact: true,
            total: true,
            category: true
          }
        },
        feedback: {
          select: {
            id: true,
            field: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    // Aggregate summary statistics
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

    // Aggregate feedback statistics
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

    // Get asset-wise statistics
    const assetStats = await db.asset.findMany({
      include: {
        _count: {
          select: {
            submissions: true,
            threats: true
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

    const assetAnalytics = assetStats.map(asset => {
      const submissions = asset.submissions;
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
        asset: {
          id: asset.id,
          name: asset.name,
          description: asset.description
        },
        statistics: {
          totalThreats: asset._count.threats,
          totalSubmissions,
          understandStats,
          riskStats,
          totalFeedback,
          completionRate: totalSubmissions > 0 ? 
            (totalSubmissions / (asset._count.threats * 1)) * 100 : 0
        }
      };
    });

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
            asset: {
              select: {
                id: true,
                name: true
              }
            },
            threat: {
              select: {
                id: true,
                name: true
              }
            },
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

    // Get detailed feedback analysis
    const feedbackAnalysis = {
      mostCommonFields: Object.entries(feedbackStats.feedbackByField)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([field, count]) => ({ field, count })),
      
      feedbackTrends: await db.feedback.groupBy({
        by: ['field'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      })
    };

    // Calculate average risk scores
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
        totalAssets: assetStats.length,
        totalThreats: assetStats.reduce((sum, a) => sum + a._count.threats, 0),
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
      },
      assetAnalytics,
      userAnalytics,
      feedbackAnalysis
    }, 'Analytics retrieved successfully');

  } catch (error) {
    return handleApiError(error, 'Failed to retrieve analytics');
  }
}

// Export protected route handler
export const GET = withAdminPin(getAnalytics);
