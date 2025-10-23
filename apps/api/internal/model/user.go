package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID        uint64         `json:"id" gorm:"primaryKey;autoIncrement"`
	UUID      string         `json:"uuid" gorm:"uniqueIndex;size:36;not null"`
	Email     string         `json:"email" gorm:"uniqueIndex;size:255;not null"`
	Password  string         `json:"-" gorm:"size:255;not null"` // Never expose password
	Name      string         `json:"name" gorm:"size:255;not null"`
	IsActive  bool           `json:"is_active" gorm:"default:true"`
	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`

	// Relationships
	Sessions []Session `json:"sessions,omitempty" gorm:"foreignKey:UserID"`
}

// Session represents user sessions for JWT token management
type Session struct {
	ID           uint64    `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID       uint64    `json:"user_id" gorm:"not null;index"`
	TokenID      string    `json:"token_id" gorm:"uniqueIndex;size:36;not null"`
	RefreshToken string    `json:"-" gorm:"size:255;not null"`
	ExpiresAt    time.Time `json:"expires_at" gorm:"not null"`
	CreatedAt    time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time `json:"updated_at" gorm:"autoUpdateTime"`

	// Relationships
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// BeforeCreate hook untuk generate UUID
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.UUID == "" {
		u.UUID = uuid.New().String()
	}
	return nil
}

func (s *Session) BeforeCreate(tx *gorm.DB) error {
	if s.TokenID == "" {
		s.TokenID = uuid.New().String()
	}
	return nil
}
