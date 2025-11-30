package api

import (
	"context"
	"go_version/internal/models"
	"go_version/internal/utils"
	"net/http"
	"slices"
	"strconv"
	"strings"
	"time"
	"unicode"

	"github.com/go-playground/validator/v10"
	"github.com/nyaruka/phonenumbers"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func sanitizeSignupRequest(body *SignupRequestBody) {
	body.FullName = sanitizeInput(body.FullName)
	body.Email = strings.ToLower(sanitizeInput(body.Email))
	body.CountryCode = strings.ToUpper(strings.TrimSpace(body.CountryCode))
	body.Phone = sanitizeInput(body.Phone)
	body.City = sanitizeInput(body.City)
	body.University = sanitizeInput(body.University)
	body.LinkedInURL = strings.TrimSpace(body.LinkedInURL)
	body.Major = sanitizeInput(body.Major)
	body.CompanyName = sanitizeInput(body.CompanyName)
	body.CompanyEmail = strings.ToLower(sanitizeInput(strings.TrimSpace(body.CompanyEmail)))
	body.CompanyLocation = sanitizeInput(body.CompanyLocation)
	body.Industry = sanitizeInput(body.Industry)
	body.Description = sanitizeInput(strings.TrimSpace(body.Description))
	for i, interest := range body.Interests {
		body.Interests[i] = sanitizeInput(interest)
	}
}

func sanitizeLoginRequest(body *LoginRequestBody) {
	body.Email = strings.ToLower(sanitizeInput(body.Email))
}

func sanitizeInput(value string) string {
	replacer := strings.NewReplacer("<", "", ">", "")
	return replacer.Replace(strings.TrimSpace(value))
}

func validatePasswordComplexity(password string) (bool, string) {
	var hasUpper, hasLower, hasNumber, hasSpecial bool
	specialChars := "!@#$%^&*()_+-=[]{};':\"\\|,.<>/?"
	for _, char := range password {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsDigit(char):
			hasNumber = true
		case strings.ContainsRune(specialChars, char):
			hasSpecial = true
		}
	}
	if len(password) < 8 {
		return false, "Password must be at least 8 characters long"
	}
	if !hasUpper {
		return false, "Password must contain at least one uppercase letter"
	}
	if !hasLower {
		return false, "Password must contain at least one lowercase letter"
	}
	if !hasNumber {
		return false, "Password must contain at least one number"
	}
	if !hasSpecial {
		return false, "Password must contain at least one special character"
	}
	return true, ""
}

// isValidPhoneNumber validates a phone number using the provided country code.
// It supports phone numbers with or without country code prefix (e.g., +1234567890 or 1234567890).
// countryCode should be a two-letter ISO country code (e.g., "US", "PS", "GB").
func isValidPhoneNumber(phone, countryCode string) (bool, string) {
	if phone == "" || countryCode == "" {
		return false, "Phone number and country code are required"
	}

	// Normalize country code to uppercase
	countryCode = strings.ToUpper(strings.TrimSpace(countryCode))

	// Try parsing the phone number with the country code
	parsedNumber, err := phonenumbers.Parse(phone, countryCode)
	if err != nil {
		return false, "Invalid phone number format: " + err.Error()
	}

	// Validate the parsed number
	if !phonenumbers.IsValidNumber(parsedNumber) {
		return false, "Phone number is not valid for the specified country"
	}

	// Verify the country code matches
	regionCode := phonenumbers.GetRegionCodeForNumber(parsedNumber)
	if regionCode != countryCode {
		return false, "Phone number country code does not match the specified country"
	}

	return true, ""
}

func isValidRole(role string) bool {
	return slices.Contains(models.GetValidRoles(), role)
}

func isValidYear(year string) (bool, string) {
	num_year, err := strconv.Atoi(year)
	if err != nil {
		return false, "Year must be a number"
	}
	if num_year < 1900 || num_year > 2100 {
		return false, "Year must be between 1900 and 2100"
	}
	return true, ""
}

func extractValidationErrors(err error) map[string]string {
	field_errors := map[string]string{}
	if err == nil {
		return field_errors
	}
	if validation_errors, ok := err.(validator.ValidationErrors); ok {
		for _, field_err := range validation_errors {
			field := strings.ToLower(field_err.Field())
			field_errors[field] = buildValidationMessage(field_err)
		}
	} else {
		field_errors["validation"] = "Invalid payload"
	}
	return field_errors
}

func buildValidationMessage(err validator.FieldError) string {
	switch err.Tag() {
	case "required":
		return "This field is required"
	case "email":
		return "Please provide a valid email address"
	case "min":
		return "Value is too short"
	case "max":
		return "Value is too long"
	case "eqfield":
		return "Fields do not match"
	case "oneof":
		return "Invalid value"
	case "url":
		return "Please provide a valid URL"
	default:
		return "Invalid value"
	}
}

func ensureEmailIsNotFound(ctx context.Context, coll *mongo.Collection, email string) error {
	filter := bson.M{"email": email}
	err := coll.FindOne(ctx, filter).Err()
	if err == nil {
		return utils.NewAppError("An account with this email already found", http.StatusNotFound, nil)
	} else if err == mongo.ErrNoDocuments {
		return nil
	}
	return utils.NewInternalServerError(err)
}

func valueFoundInDatabase(ctx context.Context, coll *mongo.Collection, field_name, value string) error {
	filter := bson.M{field_name: value}
	err := coll.FindOne(ctx, filter).Err()
	if err == mongo.ErrNoDocuments {
		return utils.NewAppError(value+" is not supported yet!", http.StatusNotFound, nil)
	} else if err != nil {
		return utils.NewInternalServerError(err)
	}
	return nil
}

func validateStringLength(value string, min, max int) bool {
	return (len(value) >= min && len(value) <= max)
}

func validateInterests(interests []string) (bool, string) {
	for _, i := range interests {
		if !validateStringLength(i, 2, 50) {
			return false, "An interest should be between 2 & 50 character"
		}
	}
	return true, ""
}

func (cfg *AppConfig) refreshTokens(user models.User) (access_token, refresh_token, refresh_token_hashed string, refresh_token_exp time.Time, is_new_refresh_token bool, err error) {
	jwt_expires_in, err := utils.ParseDurationWithDays(cfg.REQUIREMENTS.JWT.JWTExpiresIn)
	if err != nil {
		return "", "", "", time.Time{}, false, utils.NewInternalServerError(err)
	}
	access_token, err = utils.GenerateAccessToken(user, cfg.REQUIREMENTS.JWT.JWTSecret, jwt_expires_in)
	if err != nil {
		return "", "", "", time.Time{}, false, utils.NewInternalServerError(err)
	}

	// Validate refresh token
	if user.RefreshTokenExp.Time().Before(time.Now()) {
		jwt_refresh_expires_in, err := utils.ParseDurationWithDays(cfg.REQUIREMENTS.JWT.JWTRefreshExpiresIn)
		if err != nil {
			return "", "", "", time.Time{}, false, utils.NewInternalServerError(err)
		}
		refresh_token_expiration_time := time.Now().Add(jwt_refresh_expires_in)
		refresh_token, refresh_token_hashed, err := utils.GenerateRefreshToken()
		if err != nil {
			return "", "", "", time.Time{}, false, utils.NewInternalServerError(err)
		}
		return access_token, refresh_token, refresh_token_hashed, refresh_token_expiration_time, true, nil
	}

	return access_token, "", "", user.RefreshTokenExp.Time(), false, nil
}
