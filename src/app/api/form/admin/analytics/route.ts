import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { jwtService } from '@/lib/jwt';
import { AuthService } from '@/lib/auth-service';
import { UserRepository } from '@/lib/user-repository';
import { passwordService } from '@/lib/password';
import { withAdminPin } from '@/lib/admin-pin-service';
import { 
  handleApiError, 
  createSuccessResponse,
  createAuthErrorResponse
} from '@/lib/error-handler';

// Initialize services
const userRepository = new UserRepository(db);
const authService = new AuthService(userRepository, passwordService, jwtService);

/**
 * Get comprehensive analytics including user feedback
 * GET /api/form/admin/analytics
 * Protected with admin PIN
 */
async function getAnalytics(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');
    const threatId = searchParams.get('threatId');
    const understandLevel = searchParams.get('understandLevel');
    const riskCategory = searchParams.get('riskCategory');
    const userId = searchParams.get('userId');

    // Build where clause for submissions
    const whereClause: any = {};
    
    if (assetId) whereClause.assetId = parseInt(assetId);
    if (threatId) whereClause.threatId = parseInt(threatId);
    if (understandLevel) whereClause.understand = understandLevel;
    if (userId) whereClause.userId = parseInt(userId);

    // Get submissions with all related data
    const submissions = await db.submission.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
          }
        },
        asset: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        threat: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        riskInput: true,
        score: true,
        feedback: {
          select: {
            id: true,
            field: true,
            message: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    // Filter by risk category if specified
    let filteredSubmissions = submissions;
    if (riskCategory) {
      filteredSubmissions = submissions.filter(submission => 
        submission.score?.category === riskCategory
      );
    }

    // Get summary statistics
    const totalSubmissions = filteredSubmissions.length;
    const understandStats = {
      mengerti: filteredSubmissions.filter(s => s.understand === 'MENGERTI').length,
      tidakMengerti: filteredSubmissions.filter(s => s.understand === 'TIDAK_MENGERTI').length
    };

    const riskCategoryStats = {
      LOW: filteredSubmissions.filter(s => s.score?.category === 'LOW').length,
      MEDIUM: filteredSubmissions.filter(s => s.score?.category === 'MEDIUM').length,
      HIGH: filteredSubmissions.filter(s => s.score?.category === 'HIGH').length
    };

    // Get feedback statistics
    const feedbackStats = {
      totalFeedback: filteredSubmissions.reduce((sum, s) => sum + s.feedback.length, 0),
      feedbackByField: {} as Record<string, number>,
      recentFeedback: [] as any[]
    };

    // Analyze feedback by field
    filteredSubmissions.forEach(submission => {
      submission.feedback.forEach(feedback => {
        feedbackStats.feedbackByField[feedback.field] = 
          (feedbackStats.feedbackByField[feedback.field] || 0) + 1;
        
        // Collect recent feedback (last 20)
        if (feedbackStats.recentFeedback.length < 20) {
          feedbackStats.recentFeedback.push({
            id: feedback.id,
            field: feedback.field,
            message: feedback.message,
            createdAt: feedback.createdAt,
            user: {
              id: submission.user.id,
              email: submission.user.email,
              name: submission.user.name
            },
            asset: {
              id: submission.asset.id,
              name: submission.asset.name
            },
            threat: {
              id: submission.threat.id,
              name: submission.threat.name
            }
          });
        }
      });
    });

    // Sort recent feedback by date
    feedbackStats.recentFeedback.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

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

    return createSuccessResponse({
      summary: {
        totalSubmissions,
        understandStats,
        riskCategoryStats,
        feedbackStats: {
          totalFeedback: feedbackStats.totalFeedback,
          feedbackByField: feedbackStats.feedbackByField
        }
      },
      submissions: filteredSubmissions.map(submission => ({
        id: submission.id,
        submittedAt: submission.submittedAt,
        understand: submission.understand,
        user: submission.user,
        asset: submission.asset,
        threat: submission.threat,
        riskInput: submission.riskInput,
        score: submission.score,
        feedback: submission.feedback
      })),
      assetAnalytics,
      userAnalytics,
      feedbackAnalysis,
      recentFeedback: feedbackStats.recentFeedback,
      filters: {
        assetId,
        threatId,
        understandLevel,
        riskCategory,
        userId
      }
    }, 'Analytics retrieved successfully');

  } catch (error) {
    return handleApiError(error, 'Failed to retrieve analytics');
  }
}

// Export protected route handler
export const GET = withAdminPin(getAnalytics);
