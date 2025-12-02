package api

import (
	"context"
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

type ctxKey string

const CtxUserID ctxKey = "user_id"

func (cfg *AppConfig) MiddlewareAuthorize(next func(w http.ResponseWriter, r *http.Request) error) func(w http.ResponseWriter, r *http.Request) error {
	return func(w http.ResponseWriter, r *http.Request) error {
		token_string, err := utils.GetBearerToken(r.Header)
		if err != nil {
			return utils.NewAppError(err.Error(), http.StatusUnauthorized, nil)
		}

		user_id, err := utils.ValidateJWT(token_string, cfg.REQUIREMENTS.JWT.JWTSecret)
		if err != nil {
			return utils.NewAppError(err.Error(), http.StatusUnauthorized, nil)
		}

		ctx := context.WithValue(r.Context(), CtxUserID, user_id)
		err = next(w, r.WithContext(ctx))
		if err != nil {
			return err
		}

		return nil
	}
}
