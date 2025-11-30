package api

import (
	"errors"
	"net/http"

	"go_version/internal/utils"
)

// HandlerFunc defines the signature Go handlers should implement so we can
// return errors that bubble into the shared writer.
type HandlerFunc func(http.ResponseWriter, *http.Request) error

// Handle wraps a HandlerFunc and makes sure any returned error is translated
// into the unified JSON envelope consumed by the frontend.
func (cfg *AppConfig) Handle(handler HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := handler(w, r); err != nil {
			cfg.respondWithError(w, err)
		}
	}
}

func (cfg *AppConfig) respondWithError(w http.ResponseWriter, err error) {
	var appErr *utils.AppError
	if errors.As(err, &appErr) {
		utils.ErrorResponseWriter(w, appErr)
		return
	}

	utils.ErrorResponseWriter(w, utils.NewInternalServerError(err))
}
