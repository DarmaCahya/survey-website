import { 
  IAuthService, 
  IUserRepository, 
  IPasswordService, 
  IJwtService,
  RegisterRequest, 
  LoginRequest, 
  RefreshTokenRequest,
  AuthResponse, 
  AuthUser,
  ValidationError,
  AuthenticationError,
  UserAlreadyExistsError,
  InvalidRefreshTokenError
} from '@/types/auth';

/**
 * Authentication service implementation
 * Follows SOLID principles - Single Responsibility Principle and Dependency Inversion Principle
 */
export class AuthService implements IAuthService {
  constructor(
    private userRepository: IUserRepository,
    private passwordService: IPasswordService,
    private jwtService: IJwtService
  ) {}

  /**
   * Register a new user
   * @param request - Registration request data
   * @returns Auth response with user and token
   */
  async register(request: RegisterRequest): Promise<AuthResponse> {
    try {
      // Validate input
      this.validateRegisterRequest(request);

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(request.email);
      if (existingUser) {
        throw new UserAlreadyExistsError('User with this email already exists');
      }

      // Hash password
      const passwordHash = await this.passwordService.hashPassword(request.password);

      // Create user
      const user = await this.userRepository.create({
        email: request.email,
        passwordHash,
        name: request.name || null,
        isActive: true,
        refreshToken: null,
        refreshTokenExp: null,
      });

      // Generate token
      const token = this.jwtService.generateToken({
        userId: user.id,
        email: user.email,
      });

      // Return response
      return {
        success: true,
        data: {
          user: this.mapUserToAuthUser(user),
          token,
        },
      };
    } catch (error) {
      if (error instanceof ValidationError || 
          error instanceof UserAlreadyExistsError) {
        throw error;
      }
      
      throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Login user
   * @param request - Login request data
   * @returns Auth response with user and token
   */
  async login(request: LoginRequest): Promise<AuthResponse> {
    try {
      // Validate input
      this.validateLoginRequest(request);

      // Find user by email
      const user = await this.userRepository.findByEmail(request.email);
      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AuthenticationError('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await this.passwordService.verifyPassword(
        request.password,
        user.passwordHash
      );

      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Generate tokens
      const token = this.jwtService.generateToken({
        userId: user.id,
        email: user.email,
      });

      const refreshToken = this.jwtService.generateRefreshToken({
        userId: user.id,
        email: user.email,
      });

      // Store refresh token in database
      const refreshTokenExp = new Date();
      refreshTokenExp.setDate(refreshTokenExp.getDate() + 7); // 7 days from now

      await this.userRepository.update(user.id, {
        refreshToken,
        refreshTokenExp,
      });

      // Return response
      return {
        success: true,
        data: {
          user: this.mapUserToAuthUser(user),
          token,
          refreshToken,
        },
      };
    } catch (error) {
      if (error instanceof ValidationError || 
          error instanceof AuthenticationError) {
        throw error;
      }
      
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Refresh access token using refresh token
   * @param request - Refresh token request data
   * @returns Auth response with new tokens
   */
  async refreshToken(request: RefreshTokenRequest): Promise<AuthResponse> {
    try {
      // Validate input
      this.validateRefreshTokenRequest(request);

      // Verify refresh token
      const payload = this.jwtService.verifyRefreshToken(request.refreshToken);
      if (!payload) {
        throw new InvalidRefreshTokenError('Invalid or expired refresh token');
      }

      // Find user
      const user = await this.userRepository.findById(payload.userId);
      if (!user || !user.isActive) {
        throw new InvalidRefreshTokenError('Invalid or expired refresh token');
      }

      // Check if stored refresh token matches
      if (user.refreshToken !== request.refreshToken) {
        throw new InvalidRefreshTokenError('Invalid or expired refresh token');
      }

      // Check if refresh token is expired
      if (user.refreshTokenExp && user.refreshTokenExp < new Date()) {
        throw new InvalidRefreshTokenError('Invalid or expired refresh token');
      }

      // Generate new tokens
      const newToken = this.jwtService.generateToken({
        userId: user.id,
        email: user.email,
      });

      const newRefreshToken = this.jwtService.generateRefreshToken({
        userId: user.id,
        email: user.email,
      });

      // Update refresh token in database
      const refreshTokenExp = new Date();
      refreshTokenExp.setDate(refreshTokenExp.getDate() + 7); // 7 days from now

      await this.userRepository.update(user.id, {
        refreshToken: newRefreshToken,
        refreshTokenExp,
      });

      // Return response
      return {
        success: true,
        data: {
          user: this.mapUserToAuthUser(user),
          token: newToken,
          refreshToken: newRefreshToken,
        },
      };
    } catch (error) {
      if (error instanceof ValidationError || 
          error instanceof InvalidRefreshTokenError) {
        throw error;
      }
      
      throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Revoke refresh token for a user
   * @param userId - User ID
   */
  async revokeRefreshToken(userId: number): Promise<void> {
    try {
      await this.userRepository.update(userId, {
        refreshToken: null,
        refreshTokenExp: null,
      });
    } catch (error) {
      throw new Error(`Failed to revoke refresh token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Logout user by revoking refresh token
   * @param userId - User ID
   * @returns Success response
   */
  async logout(userId: number): Promise<{ success: boolean; message: string }> {
    try {
      await this.revokeRefreshToken(userId);
      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      throw new Error(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate token and return user
   * @param token - JWT token
   * @returns User data or null if invalid
   */
  async validateToken(token: string): Promise<AuthUser | null> {
    try {
      if (!token) {
        return null;
      }

      // Verify token
      const payload = this.jwtService.verifyToken(token);
      if (!payload) {
        return null;
      }

      // Find user
      const user = await this.userRepository.findById(payload.userId);
      if (!user || !user.isActive) {
        return null;
      }

      return this.mapUserToAuthUser(user);
    } catch (error) {
      console.error('Token validation failed:', error);
      return null;
    }
  }

  /**
   * Validate registration request
   * @param request - Registration request
   */
  private validateRegisterRequest(request: RegisterRequest): void {
    if (!request.email) {
      throw new ValidationError('Email is required');
    }

    if (!request.password) {
      throw new ValidationError('Password is required');
    }

    if (!this.isValidEmail(request.email)) {
      throw new ValidationError('Invalid email format');
    }

    // Basic password validation
    if (!request.password || request.password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long');
    }

    if (request.name && request.name.length > 100) {
      throw new ValidationError('Name must be less than 100 characters');
    }
  }

  /**
   * Validate login request
   * @param request - Login request
   */
  private validateLoginRequest(request: LoginRequest): void {
    if (!request.email) {
      throw new ValidationError('Email is required');
    }

    if (!request.password) {
      throw new ValidationError('Password is required');
    }

    if (!this.isValidEmail(request.email)) {
      throw new ValidationError('Invalid email format');
    }
  }

  /**
   * Validate refresh token request
   * @param request - Refresh token request
   */
  private validateRefreshTokenRequest(request: RefreshTokenRequest): void {
    if (!request.refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    if (typeof request.refreshToken !== 'string' || request.refreshToken.trim().length === 0) {
      throw new ValidationError('Invalid refresh token format');
    }
  }

  /**
   * Validate email format
   * @param email - Email to validate
   * @returns True if valid email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Map Prisma User to AuthUser (exclude sensitive data)
   * @param user - Prisma User object
   * @returns AuthUser object
   */
  private mapUserToAuthUser(user: { id: number; email: string; name: string | null; isActive: boolean; createdAt: Date; updatedAt: Date }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
