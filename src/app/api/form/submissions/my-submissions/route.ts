import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { jwtService } from '@/lib/jwt';
import { AuthService } from '@/lib/auth-service';
import { UserRepository } from '@/lib/user-repository';
import { passwordService } from '@/lib/password';
import { 
  handleApiError, 
  createSuccessResponse,
  createAuthErrorResponse
} from '@/lib/error-handler';

// Initialize services
const userRepository = new UserRepository(db);
const authService = new AuthService(userRepository, passwordService, jwtService);

/**
 * Get all submissions for authenticated user with question tracking
 * GET /api/form/submissions/my-submissions
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
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

    // Get all submissions for the user
    const submissions = await db.submission.findMany({
      where: { userId: user.id },
      include: {
        riskInput: true,
        score: true,
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
        feedback: {
          select: {
            id: true,
            field: true,
            message: true,
            createdAt: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    // Transform submissions to include question tracking
    const submissionsWithQuestions = submissions.map(submission => ({
      id: submission.id,
      submittedAt: submission.submittedAt,
      understand: submission.understand,
      context: {
        asset: submission.asset,
        threat: submission.threat
      },
      questions: {
        riskAssessment: {
          "Peluang Serangan": {
            question: "Peluang Serangan",
            answer: submission.riskInput?.f || null,
            meaning: submission.riskInput?.f ? getPeluangSeranganMeaning(submission.riskInput.f) : null
          },
          "Impact": {
            question: "Impact",
            answer: submission.riskInput?.g || null,
            meaning: submission.riskInput?.g ? getImpactMeaning(submission.riskInput.g) : null
          },
          "Total Resiko": {
            question: "Total Resiko",
            answer: submission.riskInput?.h || null,
            meaning: submission.riskInput?.h ? getTotalResikoMeaning(submission.riskInput.h) : null
          },
          "Kategori Risiko": {
            question: "Kategori Risiko",
            answer: submission.riskInput?.i || null,
            meaning: submission.riskInput?.i ? getKategoriRisikoMeaning(submission.riskInput.i) : null
          }
        },
        understanding: {
          question: "Apakah Anda memahami ancaman ini?",
          answer: submission.understand,
          meaning: submission.understand === 'MENGERTI' ? 'Mengerti' : 'Tidak Mengerti'
        }
      },
      calculatedScores: submission.score ? {
        peluang: submission.score.peluang,
        impact: submission.score.impact,
        total: submission.score.total,
        category: submission.score.category
      } : null,
      feedback: submission.feedback,
      status: submission.score ? 'COMPLETED' : 'IN_PROGRESS'
    }));

    return createSuccessResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      submissions: submissionsWithQuestions,
      summary: {
        total: submissions.length,
        completed: submissions.filter(s => s.score).length,
        inProgress: submissions.filter(s => !s.score).length
      }
    }, 'User submissions retrieved successfully');

  } catch (error) {
    return handleApiError(error, 'Failed to retrieve user submissions');
  }
}

// Helper functions to provide meaning for each answer
function getPeluangSeranganMeaning(value: number): string {
  const meanings = {
    1: "Sangat Rendah - Ancaman hampir tidak mungkin terjadi",
    2: "Rendah - Ancaman jarang terjadi",
    3: "Sedang - Ancaman kadang-kadang terjadi",
    4: "Tinggi - Ancaman sering terjadi",
    5: "Sangat Tinggi - Ancaman sangat sering terjadi",
    6: "Kritis - Ancaman hampir pasti terjadi"
  };
  return meanings[value as keyof typeof meanings] || "Unknown";
}

function getImpactMeaning(value: number): string {
  const meanings = {
    1: "Minimal - Dampak sangat kecil",
    2: "Kecil - Dampak kecil",
    3: "Sedang - Dampak sedang",
    4: "Besar - Dampak besar",
    5: "Sangat Besar - Dampak sangat besar",
    6: "Kritis - Dampak kritis"
  };
  return meanings[value as keyof typeof meanings] || "Unknown";
}

function getTotalResikoMeaning(value: number): string {
  const meanings = {
    1: "Jarang Sekali - Hampir tidak pernah terjadi",
    2: "Jarang - Jarang terjadi",
    3: "Kadang-kadang - Kadang terjadi",
    4: "Sering - Sering terjadi",
    5: "Sangat Sering - Sangat sering terjadi",
    6: "Terus Menerus - Terus menerus terjadi"
  };
  return meanings[value as keyof typeof meanings] || "Unknown";
}

function getKategoriRisikoMeaning(value: number): string {
  const meanings = {
    2: "Cepat Pulih - Bisa pulih dalam waktu singkat",
    4: "Sedang Pulih - Butuh waktu sedang untuk pulih",
    6: "Lambat Pulih - Butuh waktu lama untuk pulih"
  };
  return meanings[value as keyof typeof meanings] || "Unknown";
}
