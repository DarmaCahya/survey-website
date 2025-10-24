import { NextRequest } from 'next/server';
import { createAuthErrorResponse } from '@/lib/error-handler';

/**
 * Admin PIN protection service
 * Simple PIN-based authentication for admin access
 */
export interface IAdminPinService {
  validatePin(pin: string): boolean;
  extractPinFromRequest(request: NextRequest): string | null;
}

export class AdminPinService implements IAdminPinService {
  private readonly validPin: string;

  constructor() {
    // Get PIN from environment variable, default to '1234' for development
    this.validPin = process.env.ADMIN_PIN || '1234';
  }

  /**
   * Validate admin PIN
   * @param pin PIN to validate
   * @returns true if PIN is valid
   */
  validatePin(pin: string): boolean {
    return pin === this.validPin;
  }

  /**
   * Extract PIN from request headers
   * @param request NextRequest object
   * @returns PIN string or null if not found
   */
  extractPinFromRequest(request: NextRequest): string | null {
    const pinHeader = request.headers.get('x-admin-pin');
    return pinHeader;
  }
}

/**
 * Admin PIN middleware
 * Protects admin routes with PIN authentication
 */
export function withAdminPin<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    const pinService = new AdminPinService();
    
    const pin = pinService.extractPinFromRequest(request);
    
    if (!pin) {
      return createAuthErrorResponse('Admin PIN is required', 401);
    }

    if (!pinService.validatePin(pin)) {
      return createAuthErrorResponse('Invalid admin PIN', 401);
    }

    return handler(request, ...args);
  };
}

// Singleton instance
export const adminPinService = new AdminPinService();
