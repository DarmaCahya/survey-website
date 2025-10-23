package service

import (
	"context"
	"fmt"
	"regexp"
	"strings"
	apperrors "survey-api/internal/errors"
	"survey-api/internal/model"
	"survey-api/internal/repository"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Register(ctx context.Context, req *RegisterRequest) (*AuthResponse, error)
	Login(ctx context.Context, req *LoginRequest) (*AuthResponse, error)
	RefreshToken(ctx context.Context, refreshToken string) (*AuthResponse, error)
	Logout(ctx context.Context, tokenID string) error
	GetProfile(ctx context.Context, userID uint64) (*UserProfile, error)
	UpdateProfile(ctx context.Context, userID uint64, req *UpdateProfileRequest) error
}

type authService struct {
	userRepo  repository.UserRepository
	jwtSecret string
}

type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
	Name     string `json:"name" validate:"required,min=2"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type UpdateProfileRequest struct {
	Name string `json:"name" validate:"required,min=2"`
}

type AuthResponse struct {
	User         *UserProfile `json:"user"`
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	ExpiresIn    int64        `json:"expires_in"`
}

type UserProfile struct {
	ID        uint64    `json:"id"`
	UUID      string    `json:"uuid"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
}

func NewAuthService(userRepo repository.UserRepository, jwtSecret string) AuthService {
	return &authService{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
	}
}

func (s *authService) Register(ctx context.Context, req *RegisterRequest) (*AuthResponse, error) {
	// Validate input
	if err := s.validateRegisterRequest(req); err != nil {
		return nil, err
	}

	// Check if user already exists
	existingUser, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err == nil && existingUser != nil {
		apperrors.LogError(fmt.Errorf("user already exists"), map[string]interface{}{
			"email":     req.Email,
			"operation": "register",
		})
		return nil, apperrors.ErrUserExists
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		apperrors.LogError(err, map[string]interface{}{
			"operation": "password_hash",
		})
		return nil, apperrors.Wrap(err, apperrors.ErrCodeInternal, "Failed to hash password", 500)
	}

	// Create user
	user := &model.User{
		Email:    strings.ToLower(strings.TrimSpace(req.Email)),
		Password: string(hashedPassword),
		Name:     strings.TrimSpace(req.Name),
		IsActive: true,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		apperrors.LogError(err, map[string]interface{}{
			"email":     req.Email,
			"operation": "user_create",
		})
		return nil, apperrors.DatabaseError("user creation", err)
	}

	// Generate tokens
	accessToken, refreshToken, expiresIn, err := s.generateTokens(user.ID, user.UUID)
	if err != nil {
		apperrors.LogError(err, map[string]interface{}{
			"user_id":   user.ID,
			"operation": "token_generation",
		})
		return nil, apperrors.Wrap(err, apperrors.ErrCodeInternal, "Failed to generate tokens", 500)
	}

	apperrors.LogInfo("User registered successfully", map[string]interface{}{
		"user_id": user.ID,
		"email":   user.Email,
	})

	return &AuthResponse{
		User:         s.toUserProfile(user),
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    expiresIn,
	}, nil
}

func (s *authService) Login(ctx context.Context, req *LoginRequest) (*AuthResponse, error) {
	// Validate input
	if err := s.validateLoginRequest(req); err != nil {
		return nil, err
	}

	// Get user by email
	user, err := s.userRepo.GetByEmail(ctx, strings.ToLower(strings.TrimSpace(req.Email)))
	if err != nil {
		apperrors.LogError(err, map[string]interface{}{
			"email":     req.Email,
			"operation": "login",
		})
		return nil, apperrors.ErrInvalidCredentials
	}

	// Check if user is active
	if !user.IsActive {
		apperrors.LogWarn("Inactive user attempted login", map[string]interface{}{
			"user_id": user.ID,
			"email":   user.Email,
		})
		return nil, apperrors.ErrUserInactive
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		apperrors.LogWarn("Invalid password attempt", map[string]interface{}{
			"user_id": user.ID,
			"email":   user.Email,
		})
		return nil, apperrors.ErrInvalidCredentials
	}

	// Generate tokens
	accessToken, refreshToken, expiresIn, err := s.generateTokens(user.ID, user.UUID)
	if err != nil {
		apperrors.LogError(err, map[string]interface{}{
			"user_id":   user.ID,
			"operation": "token_generation",
		})
		return nil, apperrors.Wrap(err, apperrors.ErrCodeInternal, "Failed to generate tokens", 500)
	}

	apperrors.LogInfo("User logged in successfully", map[string]interface{}{
		"user_id": user.ID,
		"email":   user.Email,
	})

	return &AuthResponse{
		User:         s.toUserProfile(user),
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    expiresIn,
	}, nil
}

func (s *authService) RefreshToken(ctx context.Context, refreshToken string) (*AuthResponse, error) {
	// Parse refresh token
	token, err := jwt.Parse(refreshToken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.jwtSecret), nil
	})

	if err != nil || !token.Valid {
		return nil, apperrors.ErrTokenInvalid
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, apperrors.ErrTokenInvalid
	}

	userUUID, ok := claims["user_uuid"].(string)
	if !ok {
		return nil, apperrors.ErrTokenInvalid
	}

	// Get user
	user, err := s.userRepo.GetByUUID(ctx, userUUID)
	if err != nil {
		return nil, apperrors.ErrUserNotFound
	}

	// Generate new tokens
	accessToken, newRefreshToken, expiresIn, err := s.generateTokens(user.ID, user.UUID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate tokens: %w", err)
	}

	return &AuthResponse{
		User:         s.toUserProfile(user),
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		ExpiresIn:    expiresIn,
	}, nil
}

func (s *authService) Logout(ctx context.Context, tokenID string) error {
	// In a real implementation, you would invalidate the token in database
	// For now, we'll just return success
	return nil
}

func (s *authService) GetProfile(ctx context.Context, userID uint64) (*UserProfile, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		apperrors.LogError(err, map[string]interface{}{
			"user_id":   userID,
			"operation": "get_profile",
		})
		return nil, apperrors.ErrUserNotFound
	}

	return s.toUserProfile(user), nil
}

func (s *authService) UpdateProfile(ctx context.Context, userID uint64, req *UpdateProfileRequest) error {
	// Validate input
	if err := s.validateUpdateProfileRequest(req); err != nil {
		return err
	}

	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		apperrors.LogError(err, map[string]interface{}{
			"user_id":   userID,
			"operation": "update_profile",
		})
		return apperrors.ErrUserNotFound
	}

	user.Name = strings.TrimSpace(req.Name)
	if err := s.userRepo.Update(ctx, user); err != nil {
		apperrors.LogError(err, map[string]interface{}{
			"user_id":   userID,
			"operation": "update_profile",
		})
		return apperrors.DatabaseError("user update", err)
	}

	apperrors.LogInfo("User profile updated", map[string]interface{}{
		"user_id": userID,
		"name":    user.Name,
	})

	return nil
}

func (s *authService) generateTokens(userID uint64, userUUID string) (string, string, int64, error) {
	// Access token (15 minutes)
	accessClaims := jwt.MapClaims{
		"user_id":   userID,
		"user_uuid": userUUID,
		"exp":       time.Now().Add(15 * time.Minute).Unix(),
		"type":      "access",
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", "", 0, err
	}

	// Refresh token (7 days)
	refreshClaims := jwt.MapClaims{
		"user_uuid": userUUID,
		"exp":       time.Now().Add(7 * 24 * time.Hour).Unix(),
		"type":      "refresh",
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", "", 0, err
	}

	return accessTokenString, refreshTokenString, 15 * 60, nil
}

func (s *authService) toUserProfile(user *model.User) *UserProfile {
	return &UserProfile{
		ID:        user.ID,
		UUID:      user.UUID,
		Email:     user.Email,
		Name:      user.Name,
		IsActive:  user.IsActive,
		CreatedAt: user.CreatedAt,
	}
}

// Validation functions
func (s *authService) validateRegisterRequest(req *RegisterRequest) error {
	if req.Email == "" {
		return apperrors.ValidationError("email", "Email is required")
	}
	if req.Name == "" {
		return apperrors.ValidationError("name", "Name is required")
	}
	if req.Password == "" {
		return apperrors.ValidationError("password", "Password is required")
	}

	// Email validation
	if !isValidEmail(req.Email) {
		return apperrors.ValidationError("email", "Invalid email format")
	}

	// Name validation
	if len(strings.TrimSpace(req.Name)) < 2 {
		return apperrors.ValidationError("name", "Name must be at least 2 characters")
	}
	if len(strings.TrimSpace(req.Name)) > 100 {
		return apperrors.ValidationError("name", "Name must be less than 100 characters")
	}

	// Password validation
	if len(req.Password) < 6 {
		return apperrors.ValidationError("password", "Password must be at least 6 characters")
	}
	if len(req.Password) > 128 {
		return apperrors.ValidationError("password", "Password must be less than 128 characters")
	}

	return nil
}

func (s *authService) validateLoginRequest(req *LoginRequest) error {
	if req.Email == "" {
		return apperrors.ValidationError("email", "Email is required")
	}
	if req.Password == "" {
		return apperrors.ValidationError("password", "Password is required")
	}

	// Email validation
	if !isValidEmail(req.Email) {
		return apperrors.ValidationError("email", "Invalid email format")
	}

	return nil
}

func (s *authService) validateUpdateProfileRequest(req *UpdateProfileRequest) error {
	if req.Name == "" {
		return apperrors.ValidationError("name", "Name is required")
	}

	// Name validation
	if len(strings.TrimSpace(req.Name)) < 2 {
		return apperrors.ValidationError("name", "Name must be at least 2 characters")
	}
	if len(strings.TrimSpace(req.Name)) > 100 {
		return apperrors.ValidationError("name", "Name must be less than 100 characters")
	}

	return nil
}

// Helper functions
func isValidEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}
