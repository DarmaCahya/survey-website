import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { withAdminPin } from '@/lib/admin-pin-service';
import { 
  handleApiError, 
  createSuccessResponse
} from '@/lib/error-handler';
import { Prisma } from '@prisma/client';

/**
 * Get user feedback analytics
 * GET /api/form/admin/feedback
 * Protected with admin PIN
 */
async function getFeedbackAnalytics(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');
    const threatId = searchParams.get('threatId');
    const understandLevel = searchParams.get('understandLevel');
    const field = searchParams.get('field');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause for feedback
    const whereClause: Prisma.FeedbackWhereInput = {};
    
    if (field) whereClause.field = field;

    // Get feedback with related submission data
    const feedback = await db.feedback.findMany({
      where: whereClause,
      include: {
        submission: {
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
            score: {
              select: {
                category: true,
                total: true,
                peluang: true,
                impact: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Apply additional filters
    let filteredFeedback = feedback;

    if (assetId) {
      filteredFeedback = filteredFeedback.filter(f => 
        f.submission.assetId === parseInt(assetId)
      );
    }

    if (threatId) {
      filteredFeedback = filteredFeedback.filter(f => 
        f.submission.threatId === parseInt(threatId)
      );
    }

    if (understandLevel) {
      filteredFeedback = filteredFeedback.filter(f => 
        f.submission.understand === understandLevel
      );
    }

    // Group feedback by understanding level
    const feedbackByUnderstanding = {
      mengerti: filteredFeedback.filter(f => f.submission.understand === 'MENGERTI'),
      tidakMengerti: filteredFeedback.filter(f => f.submission.understand === 'TIDAK_MENGERTI')
    };

    // Group feedback by risk category
    const feedbackByRiskCategory = {
      LOW: filteredFeedback.filter(f => f.submission.score?.category === 'LOW'),
      MEDIUM: filteredFeedback.filter(f => f.submission.score?.category === 'MEDIUM'),
      HIGH: filteredFeedback.filter(f => f.submission.score?.category === 'HIGH')
    };

    // Get field statistics
    const fieldStats = await db.feedback.groupBy({
      by: ['field'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    // Get recent feedback trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentFeedbackTrends = await db.feedback.groupBy({
      by: ['field'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    // Get feedback by asset
    const feedbackByAsset = await db.asset.findMany({
      include: {
        submissions: {
          include: {
            feedback: {
              include: {
                submission: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        email: true,
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const assetFeedbackStats = feedbackByAsset.map(asset => {
      const allFeedback = asset.submissions.flatMap(s => s.feedback);
      const feedbackByField = allFeedback.reduce((acc, feedback) => {
        acc[feedback.field] = (acc[feedback.field] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        asset: {
          id: asset.id,
          name: asset.name,
          description: asset.description
        },
        totalFeedback: allFeedback.length,
        feedbackByField,
        recentFeedback: allFeedback
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)
          .map(feedback => ({
            id: feedback.id,
            field: feedback.field,
            message: feedback.message,
            createdAt: feedback.createdAt,
            user: feedback.submission.user
          }))
      };
    });

    // Get detailed feedback messages for analysis
    const detailedFeedback = filteredFeedback.map(feedback => ({
      id: feedback.id,
      field: feedback.field,
      message: feedback.message,
      createdAt: feedback.createdAt,
      submission: {
        id: feedback.submission.id,
        understand: feedback.submission.understand,
        submittedAt: feedback.submission.submittedAt,
        user: feedback.submission.user,
        asset: feedback.submission.asset,
        threat: feedback.submission.threat,
        score: feedback.submission.score
      }
    }));

    // Get feedback insights
    const insights = {
      totalFeedback: filteredFeedback.length,
      mostCommonField: fieldStats[0]?.field || 'N/A',
      mostCommonFieldCount: fieldStats[0]?._count.id || 0,
      averageFeedbackPerSubmission: filteredFeedback.length > 0 ? 
        filteredFeedback.length / new Set(filteredFeedback.map(f => f.submissionId)).size : 0,
      feedbackWithHighRisk: filteredFeedback.filter(f => f.submission.score?.category === 'HIGH').length,
      feedbackWithLowRisk: filteredFeedback.filter(f => f.submission.score?.category === 'LOW').length,
      understandingGap: {
        mengertiFeedback: feedbackByUnderstanding.mengerti.length,
        tidakMengertiFeedback: feedbackByUnderstanding.tidakMengerti.length,
        gapRatio: feedbackByUnderstanding.tidakMengerti.length > 0 ? 
          feedbackByUnderstanding.mengerti.length / feedbackByUnderstanding.tidakMengerti.length : 0
      }
    };

    return createSuccessResponse({
      insights,
      fieldStats,
      recentFeedbackTrends,
      feedbackByUnderstanding,
      feedbackByRiskCategory,
      assetFeedbackStats,
      detailedFeedback,
      filters: {
        assetId,
        threatId,
        understandLevel,
        field,
        limit
      }
    }, 'Feedback analytics retrieved successfully');

  } catch (error) {
    return handleApiError(error, 'Failed to retrieve feedback analytics');
  }
}

// Export protected route handler
export const GET = withAdminPin(getFeedbackAnalytics);
