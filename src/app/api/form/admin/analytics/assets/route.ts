import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { withAdminPin } from '@/lib/admin-pin-service';
import { 
  handleApiError, 
  createSuccessResponse
} from '@/lib/error-handler';

/**
 * Get asset-wise analytics
 * GET /api/form/admin/analytics/assets
 * Protected with admin PIN
 */
async function getAssetAnalytics(_request: NextRequest) {
  try {
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

    return createSuccessResponse({
      totalAssets: assetAnalytics.length,
      assets: assetAnalytics
    }, 'Asset analytics retrieved successfully');

  } catch (error) {
    return handleApiError(error, 'Failed to retrieve asset analytics');
  }
}

export const GET = withAdminPin(getAssetAnalytics);

