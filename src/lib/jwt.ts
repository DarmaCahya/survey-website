import jwt from 'jsonwebtoken';
import { IJwtService, TokenPayload } from '@/types/auth';

/**
 * JWT service implementation
 * Follows SOLID principles - Single Responsibility Principle
 */
export class JwtService implements IJwtService {
  private readonly secret: string;
  private readonly expiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor(secret: string, expiresIn: string = '15m', refreshExpiresIn: string = '7d') {
    if (!secret) {
      throw new Error('JWT secret is required');
    }
    this.secret = secret;
    this.expiresIn = expiresIn;
    this.refreshExpiresIn = refreshExpiresIn;
  }

  /**
   * Generate a JWT token
   * @param payload - Token payload data
   * @returns JWT token string
   */
  generateToken(payload: TokenPayload): string {
    try {
      const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
        iat: Math.floor(Date.now() / 1000),
      };

      return jwt.sign(tokenPayload, this.secret, {
        expiresIn: this.expiresIn,
        issuer: 'survey-website',
        audience: 'survey-website-users',
      } as jwt.SignOptions);
    } catch (error) {
      throw new Error(`Token generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify and decode a JWT token
   * @param token - JWT token string
   * @returns Decoded token payload or null if invalid
   */
  verifyToken(token: string): TokenPayload | null {
    try {
      if (!token) {
        return null;
      }

      // Remove 'Bearer ' prefix if present
      const cleanToken = token.replace(/^Bearer\s+/i, '');

      const decoded = jwt.verify(cleanToken, this.secret, {
        issuer: 'survey-website',
        audience: 'survey-website-users',
      }) as TokenPayload;

      return decoded;
    } catch {
      // Log error for debugging but don't expose details
      console.error('Token verification failed');
      return null;
    }
  }

  /**
   * Decode token without verification (for debugging purposes)
   * @param token - JWT token string
   * @returns Decoded token payload or null
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      if (!token) {
        return null;
      }

      const cleanToken = token.replace(/^Bearer\s+/i, '');
      const decoded = jwt.decode(cleanToken) as TokenPayload;
      
      return decoded;
    } catch (error) {
      console.error('Token decoding failed:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   * @param token - JWT token string
   * @returns True if token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }

  /**
   * Generate a refresh token
   * @param payload - Token payload data
   * @returns Refresh token string
   */
  generateRefreshToken(payload: TokenPayload): string {
    try {
      const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000),
      };

      return jwt.sign(tokenPayload, this.secret, {
        expiresIn: this.refreshExpiresIn,
        issuer: 'survey-website',
        audience: 'survey-website-users',
      } as jwt.SignOptions);
    } catch (error) {
      throw new Error(`Refresh token generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify refresh token
   * @param token - Refresh token string
   * @returns Decoded token payload or null if invalid
   */
  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      if (!token) {
        return null;
      }

      const decoded = jwt.verify(token, this.secret, {
        issuer: 'survey-website',
        audience: 'survey-website-users',
      }) as TokenPayload & { type?: string };

      // Check if it's a refresh token
      if (decoded.type !== 'refresh') {
        return null;
      }

      return {
        userId: decoded.userId,
        email: decoded.email,
        iat: decoded.iat,
        exp: decoded.exp,
      };
    } catch {
      // Log error for debugging but don't expose details
      console.error('Refresh token verification failed');
      return null;
    }
  }

  /**
   * Extract token from Authorization header
   * @param authHeader - Authorization header value
   * @returns Token string or null
   */
  extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return null;
    }

    return parts[1];
  }
}

// Singleton instance for dependency injection
const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export const jwtService = new JwtService(jwtSecret, jwtExpiresIn, jwtRefreshExpiresIn);
