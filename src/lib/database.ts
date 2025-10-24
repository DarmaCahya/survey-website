import { PrismaClient } from '@prisma/client';

/**
 * Database utility for managing Prisma client
 * Follows SOLID principles - Single Responsibility Principle
 */
class DatabaseService {
  private static instance: PrismaClient | null = null;

  /**
   * Get singleton Prisma client instance
   * @returns PrismaClient instance
   */
  static getInstance(): PrismaClient {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    }
    return DatabaseService.instance;
  }

  /**
   * Close database connection
   */
  static async close(): Promise<void> {
    if (DatabaseService.instance) {
      await DatabaseService.instance.$disconnect();
      DatabaseService.instance = null;
    }
  }

  /**
   * Health check for database connection
   * @returns Promise<boolean> - True if database is healthy
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const prisma = DatabaseService.getInstance();
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance();

// Export utility functions
export { DatabaseService };
