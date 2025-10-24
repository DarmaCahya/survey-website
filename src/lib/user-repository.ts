import { PrismaClient, User } from '@prisma/client';
import { IUserRepository } from '@/types/auth';

/**
 * User repository implementation using Prisma
 * Follows SOLID principles - Single Responsibility Principle
 */
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find user by email
   * @param email - User email
   * @returns User or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find user by ID
   * @param id - User ID
   * @returns User or null if not found
   */
  async findById(id: number): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Failed to find user by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new user
   * @param userData - User data without ID and timestamps
   * @returns Created user
   */
  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: {
          ...userData,
          email: userData.email.toLowerCase(),
        },
      });
    } catch (error) {
      // Handle unique constraint violation
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        throw new Error('User with this email already exists');
      }
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update user data
   * @param id - User ID
   * @param userData - Partial user data to update
   * @returns Updated user
   */
  async update(id: number, userData: Partial<User>): Promise<User> {
    try {
      const updateData = { ...userData };
      
      // Ensure email is lowercase if provided
      if (updateData.email) {
        updateData.email = updateData.email.toLowerCase();
      }

      return await this.prisma.user.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to update not found')) {
        throw new Error('User not found');
      }
      throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if user exists by email
   * @param email - User email
   * @returns True if user exists
   */
  async existsByEmail(email: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true },
      });
      return user !== null;
    } catch (error) {
      throw new Error(`Failed to check user existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user count
   * @returns Total number of users
   */
  async count(): Promise<number> {
    try {
      return await this.prisma.user.count();
    } catch (error) {
      throw new Error(`Failed to count users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get active users count
   * @returns Number of active users
   */
  async countActive(): Promise<number> {
    try {
      return await this.prisma.user.count({
        where: { isActive: true },
      });
    } catch (error) {
      throw new Error(`Failed to count active users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
