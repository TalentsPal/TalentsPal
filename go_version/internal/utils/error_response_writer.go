package utils

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

func ErrorResponseWriter(w http.ResponseWriter, appErr *AppError) {
	if appErr == nil {
		appErr = NewInternalServerError(nil)
	}

	error_response := Response{
		Success: false,
		Message: appErr.Message,
		Errors:  appErr.Fields,
	}

	if inDevelopmentMode() {
		error_response.Error = appErr.Error()
		error_response.Stack = appErr.Stack()
	}

	error_response_json, err := json.Marshal(error_response)
	if err != nil {
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusInternalServerError)
		fallback_message := appErr.Message
		if fallback_message == "" {
			fallback_message = "Unknown Error!"
		}
		_, write_err := w.Write([]byte(fallback_message))
		if write_err != nil {
			fmt.Printf("error writing error fallback response: %v\n", err)
		}
		return
	}

	log.Printf("error: status=%d message=%s details=%v\n", appErr.StatusCode, appErr.Message, appErr.Fields)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(appErr.StatusCode)
	_, write_err := w.Write(error_response_json)
	if write_err != nil {
		fmt.Printf("error writing error response: %v\n", err)
	}
}
