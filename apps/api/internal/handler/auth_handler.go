package handler

import (
	"net/http"
	apperrors "survey-api/internal/errors"
	"survey-api/internal/service"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService service.AuthService
}

func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// Register godoc
// @Summary Register a new user
// @Description Register a new user with email, password, and name
// @Tags auth
// @Accept json
// @Produce json
// @Param request body service.RegisterRequest true "Register request"
// @Success 201 {object} service.AuthResponse
// @Failure 400 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req service.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apperrors.LogError(err, map[string]interface{}{
			"operation": "register",
			"step":      "json_binding",
		})
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
			"code":  "INVALID_INPUT",
		})
		return
	}

	response, err := h.authService.Register(c.Request.Context(), &req)
	if err != nil {
		appErr := apperrors.GetAppError(err)
		if appErr != nil {
			apperrors.LogError(err, map[string]interface{}{
				"operation": "register",
				"email":     req.Email,
			})
			c.JSON(appErr.HTTPStatus, gin.H{
				"error":   appErr.Message,
				"code":    appErr.Code,
				"details": appErr.Details,
			})
			return
		}

		// Fallback for unexpected errors
		apperrors.LogError(err, map[string]interface{}{
			"operation": "register",
			"email":     req.Email,
		})
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Internal server error",
			"code":  "INTERNAL_ERROR",
		})
		return
	}

	c.JSON(http.StatusCreated, response)
}

// Login godoc
// @Summary Login user
// @Description Login user with email and password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body service.LoginRequest true "Login request"
// @Success 200 {object} service.AuthResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req service.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apperrors.LogError(err, map[string]interface{}{
			"operation": "login",
			"step":      "json_binding",
		})
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
			"code":  "INVALID_INPUT",
		})
		return
	}

	response, err := h.authService.Login(c.Request.Context(), &req)
	if err != nil {
		appErr := apperrors.GetAppError(err)
		if appErr != nil {
			apperrors.LogError(err, map[string]interface{}{
				"operation": "login",
				"email":     req.Email,
			})
			c.JSON(appErr.HTTPStatus, gin.H{
				"error":   appErr.Message,
				"code":    appErr.Code,
				"details": appErr.Details,
			})
			return
		}

		// Fallback for unexpected errors
		apperrors.LogError(err, map[string]interface{}{
			"operation": "login",
			"email":     req.Email,
		})
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Internal server error",
			"code":  "INTERNAL_ERROR",
		})
		return
	}

	c.JSON(http.StatusOK, response)
}

// RefreshToken godoc
// @Summary Refresh access token
// @Description Refresh access token using refresh token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body map[string]string true "Refresh token request"
// @Success 200 {object} service.AuthResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /auth/refresh [post]
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Refresh token is required"})
		return
	}

	response, err := h.authService.RefreshToken(c.Request.Context(), req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	c.JSON(http.StatusOK, response)
}

// Logout godoc
// @Summary Logout user
// @Description Logout user and invalidate tokens
// @Tags auth
// @Security BearerAuth
// @Accept json
// @Produce json
// @Success 200 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	// Get token ID from context (you might want to implement this)
	tokenID := c.GetString("token_id")

	if err := h.authService.Logout(c.Request.Context(), tokenID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to logout"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// GetProfile godoc
// @Summary Get user profile
// @Description Get current user profile information
// @Tags auth
// @Security BearerAuth
// @Accept json
// @Produce json
// @Success 200 {object} service.UserProfile
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /profile [get]
func (h *AuthHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	profile, err := h.authService.GetProfile(c.Request.Context(), userID.(uint64))
	if err != nil {
		appErr := apperrors.GetAppError(err)
		if appErr != nil {
			c.JSON(appErr.HTTPStatus, gin.H{
				"error": appErr.Message,
				"code":  appErr.Code,
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Internal server error",
			"code":  "INTERNAL_ERROR",
		})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// UpdateProfile godoc
// @Summary Update user profile
// @Description Update current user profile information
// @Tags auth
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body service.UpdateProfileRequest true "Update profile request"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /profile [put]
func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	var req service.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Basic validation
	if req.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name is required"})
		return
	}

	if len(req.Name) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name must be at least 2 characters"})
		return
	}

	if err := h.authService.UpdateProfile(c.Request.Context(), userID.(uint64), &req); err != nil {
		appErr := apperrors.GetAppError(err)
		if appErr != nil {
			c.JSON(appErr.HTTPStatus, gin.H{
				"error": appErr.Message,
				"code":  appErr.Code,
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Internal server error",
			"code":  "INTERNAL_ERROR",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}
