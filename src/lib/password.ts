import bcrypt from 'bcryptjs';
import { IPasswordService } from '@/types/auth';

/**
 * Password service implementation using bcrypt
 * Follows SOLID principles - Single Responsibility Principle
 */
export class PasswordService implements IPasswordService {
  private readonly saltRounds: number;

  constructor(saltRounds: number = 12) {
    this.saltRounds = saltRounds;
  }

  /**
   * Hash a password using bcrypt
   * @param password - Plain text password
   * @returns Promise<string> - Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    try {
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const salt = await bcrypt.genSalt(this.saltRounds);
      const hash = await bcrypt.hash(password, salt);
      
      return hash;
    } catch (error) {
      throw new Error(`Password hashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify a password against its hash
   * @param password - Plain text password
   * @param hash - Hashed password
   * @returns Promise<boolean> - True if password matches
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      if (!password || !hash) {
        return false;
      }

      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error(`Password verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate password strength
   * @param password - Password to validate
   * @returns Object with validation result and message
   */
  validatePasswordStrength(password: string): { isValid: boolean; message: string } {
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    }

    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }

    if (password.length > 128) {
      return { isValid: false, message: 'Password must be less than 128 characters' };
    }
    return { isValid: true, message: 'Password is valid' };
  }
}

// Singleton instance for dependency injection
export const passwordService = new PasswordService();
