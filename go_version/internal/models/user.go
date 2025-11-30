package models

import (
	"go.mongodb.org/mongo-driver/v2/bson"
)

const USERS_COLLECTION = "users"

const (
	ROLE_STUDENT = "student"
	ROLE_COMPANY = "company"
	ROLE_ADMIN   = "admin"
)

type User struct {
	ID bson.ObjectID `bson:"_id,omitempty"`

	// Basic user info
	FullName     string `bson:"fullName,omitempty"`
	Email        string `bson:"email,omitempty"`
	Password     string `bson:"password,omitempty"`
	GoogleID     string `bson:"googleId,omitempty"`
	LinkedInID   string `bson:"linkedinId,omitempty"`
	LinkedInURL  string `bson:"linkedInUrl,omitempty"`
	ProfileImage string `bson:"profileImage,omitempty"`
	Bio          string `bson:"bio,omitempty"`

	// Contact
	Phone string `bson:"phone,omitempty"`
	City  string `bson:"city,omitempty"`

	// Academic
	University     string `bson:"university,omitempty"`
	Major          string `bson:"major,omitempty"`
	GraduationYear string `bson:"graduationYear,omitempty"`

	// Interests and role
	Role      string   `bson:"role,omitempty"`
	Interests []string `bson:"interests,omitempty"`

	// Email verification fields
	EmailVerificationToken   string        `bson:"emailVerificationToken,omitempty"`
	EmailVerificationExpires bson.DateTime `bson:"emailVerificationExpires,omitempty"`

	// Company-specific fields
	CompanyName     string `bson:"companyName,omitempty"`
	CompanyEmail    string `bson:"companyEmail,omitempty"`
	CompanyLocation string `bson:"companyLocation,omitempty"`
	Industry        string `bson:"industry,omitempty"`
	Description     string `bson:"description,omitempty"`

	// Flags
	IsEmailVerified   bool `bson:"isEmailVerified,omitempty"`
	IsProfileComplete bool `bson:"isProfileComplete,omitempty"`
	IsActive          bool `bson:"isActive,omitempty"`

	// Refresh JWT Token
	RefreshToken    string        `bson:"refreshToken,omitempty"`
	RefreshTokenExp bson.DateTime `bson:"refreshTokenExp,omitempty"`

	// Timestamps
	CreatedAt bson.DateTime `bson:"createdAt,omitempty"`
	UpdatedAt bson.DateTime `bson:"updatedAt,omitempty"`

	// Version (__v)
	Version int32 `bson:"__v,omitempty"`
}

func GetValidRoles() []string {
	Roles := []string{ROLE_STUDENT, ROLE_COMPANY, ROLE_ADMIN}
	return Roles
}

type BasePublicProfile struct {
	ID                bson.ObjectID `json:"id"`
	FullName          string        `json:"fullName"`
	Email             string        `json:"email"`
	Role              string        `json:"role"`
	Phone             string        `json:"phone"`
	City              string        `json:"city"`
	IsEmailVerified   bool          `json:"isEmailVerified"`
	IsActive          bool          `json:"isActive"`
	IsProfileComplete bool          `json:"isProfileComplete"`
	ProfileImage      string        `json:"profileImage"`
	CreatedAt         bson.DateTime `json:"createdAt"`
	UpdatedAt         bson.DateTime `json:"updatedAt"`
}

type StudentPublicProfile struct {
	BasePublicProfile
	LinkedInURL    string   `json:"linkedInUrl"`
	University     string   `json:"university"`
	Major          string   `json:"major"`
	GraduationYear string   `json:"graduationYear"`
	Interests      []string `json:"interests"`
	Bio            string   `json:"bio"`
}

type CompanyPublicProfile struct {
	BasePublicProfile
	CompanyName     string `json:"companyName"`
	CompanyEmail    string `json:"companyEmail"`
	CompanyLocation string `json:"companyLocation"`
	Industry        string `json:"industry"`
	Description     string `json:"description"`
}

func (u *User) GetPublicProfile() interface{} {
	base := BasePublicProfile{
		ID:                u.ID,
		FullName:          u.FullName,
		Email:             u.Email,
		Role:              u.Role,
		Phone:             u.Phone,
		City:              u.City,
		IsEmailVerified:   u.IsEmailVerified,
		IsProfileComplete: u.IsProfileComplete,
		IsActive:          u.IsActive,
		ProfileImage:      u.ProfileImage,
		CreatedAt:         u.CreatedAt,
		UpdatedAt:         u.UpdatedAt,
	}

	switch u.Role {
	case "student":
		return StudentPublicProfile{
			BasePublicProfile: base,
			LinkedInURL:       u.LinkedInURL,
			University:        u.University,
			Major:             u.Major,
			GraduationYear:    u.GraduationYear,
			Interests:         u.Interests,
			Bio:               u.Bio,
		}

	case "company":
		return CompanyPublicProfile{
			BasePublicProfile: base,
			CompanyName:       u.CompanyName,
			CompanyEmail:      u.CompanyEmail,
			CompanyLocation:   u.CompanyLocation,
			Industry:          u.Industry,
			Description:       u.Description,
		}
	}

	return base
}
