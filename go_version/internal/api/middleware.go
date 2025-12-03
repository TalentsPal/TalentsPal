package api

import (
	"context"
	"errors"
	"net/http"
	"time"

	"go_version/internal/models"
	"go_version/internal/utils"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
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
const CtxUser ctxKey = "user"

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

		db_ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
		defer cancel()

		user_coll := cfg.DATABASE.Collection(models.USERS_COLLECTION)

		// Find user by id
		var user models.User
		err = user_coll.FindOne(db_ctx, bson.M{"_id": user_id}).Decode(&user)
		if err == mongo.ErrNoDocuments {
			return utils.NewAppError("User not found", http.StatusNotFound, nil)
		} else if err != nil {
			return utils.NewInternalServerError(err)
		}

		req_ctx := context.WithValue(r.Context(), CtxUserID, user_id)
		req_ctx = context.WithValue(req_ctx, CtxUser, user)
		err = next(w, r.WithContext(req_ctx))
		if err != nil {
			return err
		}

		return nil
	}
}
