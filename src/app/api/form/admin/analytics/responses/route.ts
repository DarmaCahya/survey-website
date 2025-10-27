import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { withAdminPin } from '@/lib/admin-pin-service';
import { 
  handleApiError, 
  createSuccessResponse
} from '@/lib/error-handler';

/**
 * Get individual user responses (Google Forms-like)
 * GET /api/form/admin/analytics/responses
 * Protected with admin PIN
 * 
 * Query parameters:
 * - assetId: Filter by asset ID
 * - threatId: Filter by threat ID
 * - userId: Filter by user ID
 */
async function getIndividualResponses(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');
    const threatId = searchParams.get('threatId');
    const userId = searchParams.get('userId');

    // Build where clause
    const where: { assetId?: number; threatId?: number; userId?: number } = {};
    if (assetId) where.assetId = parseInt(assetId);
    if (threatId) where.threatId = parseInt(threatId);
    if (userId) where.userId = parseInt(userId);

    // Get submissions with detailed data
    const submissions = await db.submission.findMany({
      where,
      select: {
        id: true,
        submittedAt: true,
        understand: true,
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
            field: true,
            message: true,
            createdAt: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true
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
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    // Transform to individual responses format
    const individualResponses = submissions.map(submission => ({
      submissionId: submission.id,
      submittedAt: submission.submittedAt,
      // User information (who answered)
      user: submission.user,
      // Asset information (what asset this is about)
      asset: submission.asset,
      // Threat information (what threat this is about)
      threat: submission.threat,
      // Understanding level
      understandingLevel: submission.understand,
      // User responses to questions
      responses: {
        biaya_pengetahuan: {
          question: "Biaya & Pengetahuan",
          answer: submission.riskInput?.f || null,
          meaning: submission.riskInput?.f ? `Level ${submission.riskInput.f} (1-6)` : null
        },
        pengaruh_kerugian: {
          question: "Pengaruh & Kerugian",
          answer: submission.riskInput?.g || null,
          meaning: submission.riskInput?.g ? `Level ${submission.riskInput.g} (1-6)` : null
        },
        frekuensi_serangan: {
          question: "Frekuensi Serangan",
          answer: submission.riskInput?.h || null,
          meaning: submission.riskInput?.h ? `Level ${submission.riskInput.h} (1-6)` : null
        },
        pemulihan: {
          question: "Pemulihan",
          answer: submission.riskInput?.i || null,
          meaning: submission.riskInput?.i ? `Level ${submission.riskInput.i} (2/4/6)` : null
        },
        memahami_ancaman: {
          question: "Apakah Anda memahami ancaman ini?",
          answer: submission.understand,
          meaning: submission.understand === 'MENGERTI' ? 'Mengerti' : 'Tidak Mengerti'
        },
        calculated_peluang: submission.score?.peluang || null,
        calculated_impact: submission.score?.impact || null,
        calculated_total: submission.score?.total || null,
        calculated_category: submission.score?.category || null
      },
      // Structured feedback information
      feedback: {
        mengerti_poin: submission.feedback.find(f => f.field === 'mengerti_poin')?.message || null,
        tidak_mengerti_poin: submission.feedback.find(f => f.field === 'Tidak_mengerti_poin' || f.field === 'tidak_mengerti_poin')?.message || null,
        description_tidak_mengerti: submission.feedback.find(f => f.field === 'description_tidak_mengerti' || f.field === 'tidak_mengerti_description')?.message || null,
        allFeedback: submission.feedback
      }
    }));

    return createSuccessResponse({
      total: individualResponses.length,
      responses: individualResponses,
      filters: {
        assetId: assetId ? parseInt(assetId) : null,
        threatId: threatId ? parseInt(threatId) : null,
        userId: userId ? parseInt(userId) : null
      }
    }, 'Individual responses retrieved successfully');

  } catch (error) {
    return handleApiError(error, 'Failed to retrieve individual responses');
  }
}

export const GET = withAdminPin(getIndividualResponses);

