import { NextResponse } from 'next/server';
import { AuthError } from '@/types/auth';

/**
 * Error handling utilities for API routes
 * Follows SOLID principles - Single Responsibility Principle
 */

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Handle errors and return appropriate HTTP response
 * @param error - Error object
 * @param defaultMessage - Default error message
 * @returns NextResponse with error details
 */
export function handleApiError(error: unknown, defaultMessage: string = 'Internal server error'): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error);

  // Handle custom AuthError
  if (error instanceof AuthError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  // Handle standard Error
  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      success: false,
      error: defaultMessage,
      code: 'UNKNOWN_ERROR',
    },
    { status: 500 }
  );
}

/**
 * Create success response
 * @param data - Response data
 * @param message - Optional success message
 * @returns NextResponse with success data
 */
export function createSuccessResponse<T>(
  data: T, 
  message?: string
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
  });
}

/**
 * Validate request body
 * @param body - Request body
 * @param requiredFields - Array of required field names
 * @throws ValidationError if validation fails
 */
export function validateRequestBody(body: unknown, requiredFields: string[]): void {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be a valid JSON object');
  }

  const bodyObj = body as Record<string, unknown>;
  for (const field of requiredFields) {
    if (!(field in bodyObj) || bodyObj[field] === null || bodyObj[field] === undefined) {
      throw new Error(`Field '${field}' is required`);
    }
  }
}

/**
 * Sanitize error message for client (remove sensitive information)
 * @param error - Error object
 * @param isDevelopment - Whether running in development mode
 * @returns Sanitized error message
 */
export function sanitizeErrorMessage(error: unknown, isDevelopment: boolean = false): string {
  if (isDevelopment) {
    return error instanceof Error ? error.message : 'Unknown error';
  }

  // In production, return generic messages for security
  if (error instanceof AuthError) {
    return error.message; // AuthError messages are already safe
  }

  return 'An unexpected error occurred';
}

/**
 * Log error with context
 * @param error - Error object
 * @param context - Additional context information
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const errorInfo = {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
  };

  console.error('Error logged:', JSON.stringify(errorInfo, null, 2));
}

/**
 * Create error response for validation failures
 * @param message - Error message
 * @param details - Additional error details
 * @returns NextResponse with validation error
 */
export function createValidationErrorResponse(
  message: string, 
  details?: Record<string, unknown>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'VALIDATION_ERROR',
      details,
    },
    { status: 400 }
  );
}

/**
 * Create error response for authentication failures
 * @param message - Error message
 * @returns NextResponse with authentication error
 */
export function createAuthErrorResponse(message: string = 'Authentication failed'): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'AUTHENTICATION_ERROR',
    },
    { status: 401 }
  );
}

/**
 * Create error response for authorization failures
 * @param message - Error message
 * @returns NextResponse with authorization error
 */
export function createAuthorizationErrorResponse(message: string = 'Access denied'): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'AUTHORIZATION_ERROR',
    },
    { status: 403 }
  );
}

/**
 * Create error response for not found
 * @param message - Error message
 * @returns NextResponse with not found error
 */
export function createNotFoundErrorResponse(message: string = 'Resource not found'): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'NOT_FOUND',
    },
    { status: 404 }
  );
}
