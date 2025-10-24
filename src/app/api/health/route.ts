import { DatabaseService } from '@/lib/database';
import { createSuccessResponse, handleApiError } from '@/lib/error-handler';

/**
 * Health check endpoint
 * GET /api/health
 */
export async function GET() {
  try {
    const dbHealthy = await DatabaseService.healthCheck();
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
      },
    };

    if (!dbHealthy) {
      return handleApiError(new Error('Database connection failed'), 'Service unhealthy');
    }

    return createSuccessResponse(health, 'All services healthy');
  } catch (error) {
    return handleApiError(error, 'Health check failed');
  }
}
