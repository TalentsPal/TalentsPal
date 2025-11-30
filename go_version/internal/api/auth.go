package api

import (
	"context"
	"log"
	"net/http"
	"strconv"
	"time"

	"go_version/internal/models"
	"go_version/internal/utils"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/v2/bson"
	"golang.org/x/crypto/bcrypt"
)

type SignupRequestBody struct {
	FullName        string   `json:"fullName" validate:"required,min=2,max=100"`
	Email           string   `json:"email" validate:"required,email,lowercase"`
	Password        string   `json:"password" validate:"required,min=8"`
	ConfirmPassword string   `json:"confirmPassword" validate:"required,eqfield=Password"`
	Role            string   `json:"role" validate:"omitempty,oneof=student company admin"`
	CountryCode     string   `json:"countryCode" validate:"required"`
	Phone           string   `json:"phone" validate:"required,numeric"`
	City            string   `json:"city" validate:"required,min=2,max=50"`
	University      string   `json:"university" validate:"required,min=2,max=100"`
	LinkedInURL     string   `json:"linkedInUrl" validate:"omitempty,url"`
	Major           string   `json:"major" validate:"required,min=2,max=50"`
	GraduationYear  string   `json:"graduationYear" validate:"omitempty"`
	Interests       []string `json:"interests"`
	CompanyName     string   `json:"companyName"`
	CompanyEmail    string   `json:"companyEmail" validate:"omitempty,email"`
	CompanyLocation string   `json:"companyLocation"`
	Industry        string   `json:"industry"`
	Description     string   `json:"description"`
}

func (cfg *AppConfig) SignupHandler(w http.ResponseWriter, r *http.Request) error {
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	req_body := SignupRequestBody{}
	if err := utils.BodyParser(r.Body, &req_body); err != nil {
		return utils.NewAppError("Error while parsing signup request body", http.StatusBadRequest, err)
	}

	// Sanitize inputs
	sanitizeSignupRequest(&req_body)
	if req_body.Role == "" {
		req_body.Role = "student"
	}

	// Apply validation tags
	validator := validator.New(validator.WithRequiredStructEnabled())
	if err := validator.Struct(req_body); err != nil {
		fieldErrors := extractValidationErrors(err)
		return utils.NewValidationError(fieldErrors)
	}

	// Validate email
	users_coll := cfg.DATABASE.Collection(models.USERS_COLLECTION)
	if err := ensureEmailIsNotFound(ctx, users_coll, req_body.Email); err != nil {
		return err
	}

	// Validate password
	if valid, message := validatePasswordComplexity(req_body.Password); !valid {
		return utils.NewAppError(message, http.StatusBadRequest, nil)
	}

	// Validate password confirmation
	if req_body.Password != req_body.ConfirmPassword {
		return utils.NewAppError("Passwords do not match", http.StatusBadRequest, nil)
	}

	// Validate role
	if !isValidRole(req_body.Role) {
		return utils.NewAppError("Invalid role specified", http.StatusBadRequest, nil)
	}

	// Validate phone number with country code
	if valid, message := isValidPhoneNumber(req_body.Phone, req_body.CountryCode); !valid {
		return utils.NewAppError(message, http.StatusBadRequest, nil)
	}

	// Validate city
	cities_coll := cfg.DATABASE.Collection(models.CITIES_COLLECTION)
	if err := valueFoundInDatabase(ctx, cities_coll, "name", req_body.City); err != nil {
		return err
	}

	// Validate university
	universities_coll := cfg.DATABASE.Collection(models.UNIVERSITIES_COLLECTION)
	if err := valueFoundInDatabase(ctx, universities_coll, "name", req_body.University); err != nil {
		return err
	}

	// Validate major
	majors_coll := cfg.DATABASE.Collection(models.MAJORS_COLLECTION)
	if err := valueFoundInDatabase(ctx, majors_coll, "name", req_body.Major); err != nil {
		return err
	}

	// Validate graduation year if provided
	if req_body.GraduationYear != "" {
		if valid, message := isValidYear(req_body.GraduationYear); !valid {
			return utils.NewAppError(message, http.StatusBadRequest, nil)
		}
	}

	if len(req_body.Interests) != 0 {
		if valid, message := validateInterests(req_body.Interests); !valid {
			return utils.NewAppError(message, http.StatusBadRequest, nil)
		}
	}

	// If role is company, validate other company-related fields
	if req_body.Role == "company" {
		if req_body.CompanyName == "" || req_body.CompanyEmail == "" || req_body.CompanyLocation == "" || req_body.Industry == "" {
			return utils.NewAppError("Please provide all required company fields", http.StatusBadRequest, nil)
		}

		industries_coll := cfg.DATABASE.Collection(models.INDUSTRIES_COLLECTION)
		if err := valueFoundInDatabase(ctx, industries_coll, "name", req_body.Industry); err != nil {
			return err
		}

		if !validateStringLength(req_body.CompanyName, 2, 50) {
			return utils.NewAppError("Company name must be between 2 & 50 characters", http.StatusBadRequest, nil)
		}

		if !validateStringLength(req_body.CompanyLocation, 2, 100) {
			return utils.NewAppError("Company location must be between 2 & 100 characters", http.StatusBadRequest, nil)
		}
	}

	hashed_password, err := bcrypt.GenerateFromPassword([]byte(req_body.Password), bcrypt.DefaultCost)
	if err != nil {
		return utils.NewInternalServerError(err)
	}

	verification_token, err := utils.GenerateVerificationToken()
	if err != nil {
		return utils.NewInternalServerError(err)
	}
	verificationExpires := time.Now().Add(24 * time.Hour)

	now := time.Now()
	user_doc := models.User{
		FullName:                 req_body.FullName,
		Email:                    req_body.Email,
		Password:                 string(hashed_password),
		Role:                     req_body.Role,
		Phone:                    req_body.Phone,
		City:                     req_body.City,
		University:               req_body.University,
		LinkedInURL:              req_body.LinkedInURL,
		Major:                    req_body.Major,
		GraduationYear:           req_body.GraduationYear,
		Interests:                req_body.Interests,
		CompanyName:              req_body.CompanyName,
		CompanyEmail:             req_body.CompanyEmail,
		CompanyLocation:          req_body.CompanyLocation,
		Industry:                 req_body.Industry,
		Description:              req_body.Description,
		EmailVerificationToken:   verification_token,
		EmailVerificationExpires: primitive.NewDateTimeFromTime(verificationExpires),
		IsEmailVerified:          false,
		IsProfileComplete:        false,
		IsActive:                 true,
		CreatedAt:                primitive.NewDateTimeFromTime(now),
		UpdatedAt:                primitive.NewDateTimeFromTime(now),
	}

	result, err := users_coll.InsertOne(ctx, user_doc)
	if err != nil {
		return utils.NewInternalServerError(err)
	}

	smtp_port, err := strconv.Atoi(cfg.REQUIREMENTS.SMTP.SMTPPort)
	if err != nil {
		return utils.NewInternalServerError(err)
	}
	error_chan := make(chan error)
	go utils.SendVerificationEmail(error_chan, cfg.REQUIREMENTS.SMTP.AppName, cfg.REQUIREMENTS.SMTP.EmailFrom, req_body.Email, cfg.REQUIREMENTS.Server.FrontendURL, verification_token, req_body.FullName, cfg.REQUIREMENTS.SMTP.SMTPHost, cfg.REQUIREMENTS.SMTP.SMTPUser, cfg.REQUIREMENTS.SMTP.SMTPPass, smtp_port)
	go func() {
		if err := <-error_chan; err != nil {
			// log it and move on
			log.Printf("Failed to send verification email: %s", err.Error())
		}
	}()

	user_id, _ := result.InsertedID.(bson.ObjectID)
	response_payload := map[string]any{
		"user": map[string]any{
			"_id":             user_id.Hex(),
			"fullName":        req_body.FullName,
			"email":           req_body.Email,
			"role":            req_body.Role,
			"isEmailVerified": false,
		},
	}

	utils.SuccessResponseWriter(
		w,
		"User registered successfully. Please check your email to verify your account.",
		response_payload,
		http.StatusCreated,
	)

	return nil
}

type LoginRequestBody struct {
	Email    string `json:"email" validate:"required,email,lowercase"`
	Password string `json:"password" validate:"required,min=8"`
}

func (cfg *AppConfig) LoginHandler(w http.ResponseWriter, r *http.Request) error {
	return nil
}
