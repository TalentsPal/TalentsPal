package utils

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"go_version/internal/models"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type AccessTokenClaims struct {
	jwt.RegisteredClaims
	UserID string `json:"userId"`
	Email  string `json:"email"`
	Role   string `json:"role"`
}

func GenerateAccessToken(user models.User, token_secret string, expires_in time.Duration) (string, error) {
	claims := jwt.RegisteredClaims{
		Issuer:    "talentspal",
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(expires_in)),
		Subject:   user.ID.Hex(),
	}
	claims_with_payload := AccessTokenClaims{
		RegisteredClaims: claims,
		UserID:           user.ID.Hex(),
		Email:            user.Email,
		Role:             user.Role,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims_with_payload)

	jwt_String, err := token.SignedString([]byte(token_secret))
	if err != nil {
		return "", errors.New("Error while signing jwt string: " + err.Error())
	}

	return jwt_String, nil
}

func GenerateRefreshToken() (string, string, error) {
	random_32_byte := make([]byte, 32)
	n, err := rand.Read(random_32_byte)
	if err != nil {
		return "", "", errors.New("Error while generating random 32 byte using rand.Read: " + err.Error())
	}
	if n != 32 {
		return "", "", errors.New("the generating random slice of bytes using rand.Read isn't exactly 32 byte")
	}

	raw_token := hex.EncodeToString(random_32_byte) // sent to client
	hashed_hex := sha256.Sum256([]byte(raw_token))
	hashed_string := hex.EncodeToString(hashed_hex[:]) // stored in DB

	return raw_token, hashed_string, nil
}

// ParseDurationWithDays parses strings like "30d", "12h", "45m"
func ParseDurationWithDays(s string) (time.Duration, error) {
	if strings.HasSuffix(s, "d") {
		numStr := strings.TrimSuffix(s, "d")
		days, err := strconv.Atoi(numStr)
		if err != nil {
			return 0, fmt.Errorf("invalid day duration: %w", err)
		}
		return time.Hour * 24 * time.Duration(days), nil
	}
	// fallback to standard ParseDuration for "h", "m", "s", etc.
	return time.ParseDuration(s)
}

func GetBearerToken(headers http.Header) (string, error) {
	bearer_token := headers.Get("Authorization")
	if bearer_token == "" {
		return "", errors.New("Authorization(Bearer Token) header not found")
	}

	bearer_token = strings.TrimSpace(bearer_token)
	if strings.HasPrefix(bearer_token, "Bearer ") {
		token := strings.TrimSpace(bearer_token[len("Bearer "):])
		return token, nil
	} else {
		return "", errors.New("header does not start with 'Bearer '")
	}
}

func ValidateJWT(tokenString, tokenSecret string) (bson.ObjectID, error) {
	user_id := bson.NewObjectID()

	if tokenString == "" {
		return user_id, errors.New("empty token")
	}

	token, err := jwt.ParseWithClaims(tokenString, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(tokenSecret), nil
	})

	if err != nil {
		return bson.NewObjectID(), errors.New("Error while parsing token string: " + err.Error())
	}

	if !token.Valid {
		return user_id, errors.New("invalid token")
	}

	expiry, err := token.Claims.GetExpirationTime()
	if err != nil {
		return user_id, errors.New("Error while fetching expiration time claim from the token: " + err.Error())
	}

	if expiry != nil && expiry.Time.Before(time.Now()) {
		return user_id, fmt.Errorf("token expired at: %v", expiry.Time)
	}

	userid_string, err := token.Claims.GetSubject()
	if err != nil {
		return user_id, errors.New("Error while fetching subject claim from the token: " + err.Error())
	}

	user_id, err = bson.ObjectIDFromHex(userid_string)
	if err != nil {
		return user_id, errors.New("Error format for user id in the subject claim, it should be a hex value convertable to bson.ObjectID: " + err.Error())
	}

	return user_id, nil
}
