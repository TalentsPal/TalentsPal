package api

import (
	"net/http"

	"go_version/utils"
)

func (cfg *AppConfig) SignupHandler(w http.ResponseWriter, r *http.Request) error {
	return utils.NewAppError("Not implemented", http.StatusNotImplemented, nil)
}
