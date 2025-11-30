package api

import (
	"context"
	"log"
	"net/http"
	"strconv"
	"time"

	"go_version/internal/models"
	"go_version/internal/utils"

	"github.com/go-chi/chi/v5"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
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
		field_errors := extractValidationErrors(err)
		return utils.NewValidationError(field_errors)
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
		EmailVerificationExpires: bson.NewDateTimeFromTime(verificationExpires),
		IsEmailVerified:          false,
		IsProfileComplete:        false,
		IsActive:                 true,
		CreatedAt:                bson.NewDateTimeFromTime(now),
		UpdatedAt:                bson.NewDateTimeFromTime(now),
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
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	req_body := LoginRequestBody{}
	if err := utils.BodyParser(r.Body, &req_body); err != nil {
		return utils.NewAppError("Error while parsing login request body", http.StatusBadRequest, err)
	}

	// Sanitize inputs
	sanitizeLoginRequest(&req_body)

	// Apply validation tags
	validator := validator.New(validator.WithRequiredStructEnabled())
	if err := validator.Struct(req_body); err != nil {
		field_errors := extractValidationErrors(err)
		return utils.NewValidationError(field_errors)
	}

	user_coll := cfg.DATABASE.Collection(models.USERS_COLLECTION)

	// Validate email
	var user models.User
	err := user_coll.FindOne(ctx, bson.M{"email": req_body.Email}).Decode(&user)
	if err == mongo.ErrNoDocuments {
		return utils.NewAppError("Invalid email or password", http.StatusUnauthorized, nil)
	} else if err != nil {
		return utils.NewInternalServerError(err)
	}

	// Validate password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req_body.Password))
	if err != nil {
		return utils.NewAppError("Invalid email or password", http.StatusUnauthorized, nil)
	}

	// Check if user is active
	if !user.IsActive {
		return utils.NewAppError("Your account has been deactivated", http.StatusUnauthorized, nil)
	}

	// Check if email is verified
	if !user.IsEmailVerified {
		return utils.NewAppError("Please verify your email before logging in. Check your inbox for the verification link.", http.StatusUnauthorized, nil)
	}

	// Generate token then send the response...
	access_token, refresh_token, refresh_token_hashed, refresh_token_exp, is_new_refresh_token, err := cfg.refreshTokens(user)
	if err != nil {
		return err
	}

	if is_new_refresh_token {
		refresh_token_update := bson.M{
			"$set": bson.M{
				"refreshToken":    refresh_token_hashed,
				"refreshTokenExp": refresh_token_exp,
			},
		}
		err := user_coll.FindOneAndUpdate(ctx, bson.M{"email": req_body.Email}, refresh_token_update).Err()
		if err != nil {
			return utils.NewInternalServerError(err)
		}
	}

	response_payload := map[string]any{
		"user":        user.GetPublicProfile(),
		"accessToken": access_token,
	}

	// Only send the refresh token when it newly refreshed
	if is_new_refresh_token {
		response_payload["refreshToken"] = refresh_token
	}

	utils.SuccessResponseWriter(
		w,
		"User logged in successfully",
		response_payload,
		http.StatusOK,
	)

	return nil
}

func (cfg *AppConfig) VerifyEmailHandler(w http.ResponseWriter, r *http.Request) error {
	token := chi.URLParam(r, "token")
	if token == "" {
		return utils.NewAppError("you should provide the token in the url of the request: /api/auth/verify-token/{token}", http.StatusBadRequest, nil)
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	user_coll := cfg.DATABASE.Collection(models.USERS_COLLECTION)

	var user models.User
	err := user_coll.FindOne(ctx, bson.M{"emailVerificationToken": token, "emailVerificationExpires": bson.M{"$gt": bson.NewDateTimeFromTime(time.Now())}}).Decode(&user)
	if err == mongo.ErrNoDocuments {
		return utils.NewAppError("Invalid or expired verification token", http.StatusBadRequest, nil)
	} else if err != nil {
		return utils.NewInternalServerError(err)
	}

	updated_user := bson.M{
		"$set": bson.M{
			"isEmailVerified":          true,
			"emailVerificationToken":   nil,
			"emailVerificationExpires": nil,
		},
	}
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	err = user_coll.FindOneAndUpdate(ctx,
		bson.M{
			"emailVerificationToken":   token,
			"emailVerificationExpires": bson.M{"$gt": bson.NewDateTimeFromTime(time.Now())},
		},
		updated_user,
		opts,
	).Decode(&user)
	if err != nil {
		return utils.NewInternalServerError(err)
	}

	access_token, refresh_token, refresh_token_hashed, refresh_token_exp, is_new_refresh_token, err := cfg.refreshTokens(user)
	if err != nil {
		return err
	}

	if is_new_refresh_token {
		refresh_token_update := bson.M{
			"$set": bson.M{
				"refreshToken":    refresh_token_hashed,
				"refreshTokenExp": refresh_token_exp,
			},
		}
		err := user_coll.FindOneAndUpdate(ctx, bson.M{"email": user.Email}, refresh_token_update, opts).Err()
		if err != nil {
			return utils.NewInternalServerError(err)
		}
	}

	response_payload := map[string]any{
		"user":        user.GetPublicProfile(),
		"accessToken": access_token,
	}

	// Only send the refresh token when it newly refreshed
	if is_new_refresh_token {
		response_payload["refreshToken"] = refresh_token
	}

	utils.SuccessResponseWriter(
		w,
		"Email verified successfully! You can now log in.",
		response_payload,
		http.StatusOK,
	)

	return nil
}
