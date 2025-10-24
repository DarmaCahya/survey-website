import { User } from "@prisma/client";

// Domain entities
export interface AuthUser {
  id: number;
  email: string;
  name?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response DTOs
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: AuthUser;
    token: string;
    refreshToken?: string;
  };
  error?: string;
}

export interface TokenPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

// Service interfaces (SOLID - Dependency Inversion Principle)
export interface IPasswordService {
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
}

export interface IJwtService {
  generateToken(payload: TokenPayload): string;
  verifyToken(token: string): TokenPayload | null;
  generateRefreshToken(payload: TokenPayload): string;
  verifyRefreshToken(token: string): TokenPayload | null;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: number, userData: Partial<User>): Promise<User>;
}

export interface IAuthService {
  register(request: RegisterRequest): Promise<AuthResponse>;
  login(request: LoginRequest): Promise<AuthResponse>;
  refreshToken(request: RefreshTokenRequest): Promise<AuthResponse>;
  logout(userId: number): Promise<{ success: boolean; message: string }>;
  validateToken(token: string): Promise<AuthUser | null>;
  revokeRefreshToken(userId: number): Promise<void>;
}

// Error types
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AuthError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class AuthenticationError extends AuthError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends AuthError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class UserNotFoundError extends AuthError {
  constructor(message: string = 'User not found') {
    super(message, 'USER_NOT_FOUND', 404);
  }
}

export class UserAlreadyExistsError extends AuthError {
  constructor(message: string = 'User already exists') {
    super(message, 'USER_ALREADY_EXISTS', 409);
  }
}

export class InvalidRefreshTokenError extends AuthError {
  constructor(message: string = 'Invalid or expired refresh token') {
    super(message, 'INVALID_REFRESH_TOKEN', 401);
  }
}
