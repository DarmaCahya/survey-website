/**
 * Custom error classes for better error handling
 */

export class ValidationError extends Error {
  public readonly code: string = 'VALIDATION_ERROR';
  public readonly statusCode: number = 400;
  public readonly field?: string;
  public readonly value?: unknown;
  public readonly allowedValues?: unknown[];

  constructor(
    message: string,
    field?: string,
    value?: unknown,
    allowedValues?: unknown[]
  ) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.allowedValues = allowedValues;
  }
}

export class InvalidRiskInputError extends ValidationError {
  public readonly description?: string;

  constructor(field: string, value: unknown, allowedValues: string, description?: string) {
    // Parse allowed values string to array
    // Handle formats like "2, 4, or 6" or "1-6" or "2, 4, 6"
    let values: string[];
    if (allowedValues.includes('or')) {
      // Handle "2, 4, or 6" format
      values = allowedValues.replace(/,\s*or\s+/g, ', ').split(', ').map(v => v.trim());
    } else if (allowedValues.includes('-')) {
      // Handle "1-6" format
      const [start, end] = allowedValues.split('-').map(v => parseInt(v.trim()));
      values = Array.from({length: end - start + 1}, (_, i) => (start + i).toString());
    } else {
      // Handle "2, 4, 6" format
      values = allowedValues.split(', ').map(v => v.trim());
    }
    
    const fieldDisplay = description ? `${description} (${field})` : field;
    const errorMessage = `Invalid ${fieldDisplay}: ${value}. Must be ${allowedValues}`;
    
    super(
      errorMessage,
      field,
      value,
      values
    );
    this.name = 'InvalidRiskInputError';
    this.description = description;
  }
}

export class BusinessLogicError extends Error {
  public readonly code: string = 'BUSINESS_LOGIC_ERROR';
  public readonly statusCode: number = 422;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'BusinessLogicError';
    this.details = details;
  }
}

export class ResourceNotFoundError extends Error {
  public readonly code: string = 'NOT_FOUND';
  public readonly statusCode: number = 404;
  public readonly resourceType?: string;
  public readonly resourceId?: string | number;

  constructor(
    message: string,
    resourceType?: string,
    resourceId?: string | number
  ) {
    super(message);
    this.name = 'ResourceNotFoundError';
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

export class DuplicateResourceError extends Error {
  public readonly code: string = 'DUPLICATE_RESOURCE';
  public readonly statusCode: number = 409;
  public readonly resourceType?: string;
  public readonly conflictingFields?: string[];

  constructor(
    message: string,
    resourceType?: string,
    conflictingFields?: string[]
  ) {
    super(message);
    this.name = 'DuplicateResourceError';
    this.resourceType = resourceType;
    this.conflictingFields = conflictingFields;
  }
}
