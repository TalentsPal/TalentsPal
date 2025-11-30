package utils

import (
	"errors"
	"log"
	"net/http"
	"os"
	"runtime/debug"
	"strings"
)

// AppError mirrors the structure used by the Node.js layer so handlers can
// describe an HTTP status code, a safe-to-show message, and optional field-level
// validation errors in a single error value.
type AppError struct {
	StatusCode int
	Message    string
	Err        error
	Fields     map[string]string
	stack      string
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return e.Err.Error()
	}
	return e.Message
}

func (e *AppError) Stack() string {
	return e.stack
}

// NewAppError builds a generic AppError with the provided status code and
// message. Use the helper constructors below for common cases.
func NewAppError(message string, statusCode int, err error) *AppError {
	return &AppError{
		StatusCode: statusCode,
		Message:    message,
		Err:        err,
		stack:      string(debug.Stack()),
	}
}

func NewBadRequest(message string) *AppError {
	return NewAppError(message, http.StatusBadRequest, errors.New(message))
}

func NewValidationError(fields map[string]string) *AppError {
	return &AppError{
		StatusCode: http.StatusBadRequest,
		Message:    "Validation Error",
		Fields:     fields,
		stack:      string(debug.Stack()),
	}
}

func NewUnauthorized(message string) *AppError {
	return NewAppError(message, http.StatusUnauthorized, errors.New(message))
}

func NewForbidden(message string) *AppError {
	return NewAppError(message, http.StatusForbidden, errors.New(message))
}

func NewConflict(message string) *AppError {
	return NewAppError(message, http.StatusConflict, errors.New(message))
}

func NewNotFound(message string) *AppError {
	return NewAppError(message, http.StatusNotFound, errors.New(message))
}

func NewInternalServerError(err error) *AppError {
	if err == nil {
		err = errors.New("internal server error")
	}
	log.Printf("internal server error: %s", err.Error())
	return &AppError{
		StatusCode: http.StatusInternalServerError,
		Message:    "Internal Server Error",
		Err:        err,
		stack:      string(debug.Stack()),
	}
}

func (e *AppError) WithFields(fields map[string]string) *AppError {
	e.Fields = fields
	return e
}

func inDevelopmentMode() bool {
	env := strings.ToLower(os.Getenv("APP_ENV"))
	if env == "" {
		env = strings.ToLower(os.Getenv("NODE_ENV"))
	}
	return env == "development" || env == "dev"
}
