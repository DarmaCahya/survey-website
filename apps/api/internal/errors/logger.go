package errors

import (
	"log/slog"
	"os"
)

// Logger is a structured logger for the application
var Logger *slog.Logger

func init() {
	// Initialize logger
	Logger = slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
}

// LogError logs an error with context
func LogError(err error, context map[string]interface{}) {
	if err == nil {
		return
	}

	// Extract AppError if available
	appErr := GetAppError(err)
	if appErr != nil {
		Logger.ErrorContext(
			nil,
			"Application error occurred",
			"error_code", appErr.Code,
			"error_message", appErr.Message,
			"error_details", appErr.Details,
			"http_status", appErr.HTTPStatus,
			"context", context,
		)
	} else {
		Logger.ErrorContext(
			nil,
			"Unexpected error occurred",
			"error", err.Error(),
			"context", context,
		)
	}
}

// LogInfo logs informational messages
func LogInfo(message string, context map[string]interface{}) {
	Logger.InfoContext(nil, message, "context", context)
}

// LogWarn logs warning messages
func LogWarn(message string, context map[string]interface{}) {
	Logger.WarnContext(nil, message, "context", context)
}

// LogDebug logs debug messages
func LogDebug(message string, context map[string]interface{}) {
	Logger.DebugContext(nil, message, "context", context)
}
