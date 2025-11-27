package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID primitive.ObjectID `bson:"_id,omitempty"`

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
	EmailVerificationToken   string             `bson:"emailVerificationToken,omitempty"`
	EmailVerificationExpires primitive.DateTime `bson:"emailVerificationExpires,omitempty"`

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

	// Timestamps
	CreatedAt primitive.DateTime `bson:"createdAt,omitempty"`
	UpdatedAt primitive.DateTime `bson:"updatedAt,omitempty"`

	// Version (__v from Node.js)
	Version int32 `bson:"__v,omitempty"`
}
