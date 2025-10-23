package errors

import (
	"errors"
	"fmt"
	"net/http"
)

// ErrorCode represents different types of errors
type ErrorCode string

const (
	// Validation errors
	ErrCodeValidation   ErrorCode = "VALIDATION_ERROR"
	ErrCodeInvalidInput ErrorCode = "INVALID_INPUT"
	ErrCodeMissingField ErrorCode = "MISSING_FIELD"

	// Authentication errors
	ErrCodeUnauthorized       ErrorCode = "UNAUTHORIZED"
	ErrCodeInvalidCredentials ErrorCode = "INVALID_CREDENTIALS"
	ErrCodeTokenExpired       ErrorCode = "TOKEN_EXPIRED"
	ErrCodeTokenInvalid       ErrorCode = "TOKEN_INVALID"

	// User errors
	ErrCodeUserNotFound ErrorCode = "USER_NOT_FOUND"
	ErrCodeUserExists   ErrorCode = "USER_ALREADY_EXISTS"
	ErrCodeUserInactive ErrorCode = "USER_INACTIVE"

	// Database errors
	ErrCodeDatabase   ErrorCode = "DATABASE_ERROR"
	ErrCodeConstraint ErrorCode = "CONSTRAINT_VIOLATION"

	// Server errors
	ErrCodeInternal           ErrorCode = "INTERNAL_ERROR"
	ErrCodeServiceUnavailable ErrorCode = "SERVICE_UNAVAILABLE"
)

// AppError represents a structured application error
type AppError struct {
	Code       ErrorCode `json:"code"`
	Message    string    `json:"message"`
	Details    string    `json:"details,omitempty"`
	HTTPStatus int       `json:"-"`
	Cause      error     `json:"-"`
}

// Error implements the error interface
func (e *AppError) Error() string {
	if e.Cause != nil {
		return fmt.Sprintf("%s: %s (caused by: %v)", e.Code, e.Message, e.Cause)
	}
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

// Unwrap returns the underlying error
func (e *AppError) Unwrap() error {
	return e.Cause
}

// New creates a new AppError
func New(code ErrorCode, message string, httpStatus int) *AppError {
	return &AppError{
		Code:       code,
		Message:    message,
		HTTPStatus: httpStatus,
	}
}

// Wrap wraps an existing error with additional context
func Wrap(err error, code ErrorCode, message string, httpStatus int) *AppError {
	return &AppError{
		Code:       code,
		Message:    message,
		Details:    err.Error(),
		HTTPStatus: httpStatus,
		Cause:      err,
	}
}

// Predefined errors
var (
	// Validation errors
	ErrValidation   = New(ErrCodeValidation, "Validation failed", http.StatusBadRequest)
	ErrInvalidInput = New(ErrCodeInvalidInput, "Invalid input provided", http.StatusBadRequest)
	ErrMissingField = New(ErrCodeMissingField, "Required field is missing", http.StatusBadRequest)

	// Authentication errors
	ErrUnauthorized       = New(ErrCodeUnauthorized, "Unauthorized access", http.StatusUnauthorized)
	ErrInvalidCredentials = New(ErrCodeInvalidCredentials, "Invalid email or password", http.StatusUnauthorized)
	ErrTokenExpired       = New(ErrCodeTokenExpired, "Token has expired", http.StatusUnauthorized)
	ErrTokenInvalid       = New(ErrCodeTokenInvalid, "Invalid token", http.StatusUnauthorized)

	// User errors
	ErrUserNotFound = New(ErrCodeUserNotFound, "User not found", http.StatusNotFound)
	ErrUserExists   = New(ErrCodeUserExists, "User already exists", http.StatusConflict)
	ErrUserInactive = New(ErrCodeUserInactive, "User account is inactive", http.StatusForbidden)

	// Database errors
	ErrDatabase   = New(ErrCodeDatabase, "Database operation failed", http.StatusInternalServerError)
	ErrConstraint = New(ErrCodeConstraint, "Database constraint violation", http.StatusConflict)

	// Server errors
	ErrInternal           = New(ErrCodeInternal, "Internal server error", http.StatusInternalServerError)
	ErrServiceUnavailable = New(ErrCodeServiceUnavailable, "Service temporarily unavailable", http.StatusServiceUnavailable)
)

// IsAppError checks if an error is an AppError
func IsAppError(err error) bool {
	var appErr *AppError
	return errors.As(err, &appErr)
}

// GetAppError extracts AppError from error chain
func GetAppError(err error) *AppError {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr
	}
	return nil
}

// ValidationError creates a validation error with specific field
func ValidationError(field, message string) *AppError {
	return &AppError{
		Code:       ErrCodeValidation,
		Message:    fmt.Sprintf("Validation failed for field '%s'", field),
		Details:    message,
		HTTPStatus: http.StatusBadRequest,
	}
}

// DatabaseError wraps database errors with proper context
func DatabaseError(operation string, err error) *AppError {
	return Wrap(err, ErrCodeDatabase, fmt.Sprintf("Database %s failed", operation), http.StatusInternalServerError)
}

// ConstraintError handles database constraint violations
func ConstraintError(constraint string, err error) *AppError {
	return Wrap(err, ErrCodeConstraint, fmt.Sprintf("Constraint violation: %s", constraint), http.StatusConflict)
}
