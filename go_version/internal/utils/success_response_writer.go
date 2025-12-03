package utils

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func SuccessResponseWriter(w http.ResponseWriter, message string, data any, status_code int) {
	success_response := Response{
		Success: true,
		Message: message,
		Data:    data,
	}
	success_response_json, err := json.Marshal(success_response)
	if err != nil {
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusInternalServerError)
		fallback_message := "faild to encode success response body: " + err.Error()
		_, write_err := w.Write([]byte(fallback_message))
		if write_err != nil {
			fmt.Printf("error writing error response: %v\n", err)
		}
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status_code)
	_, write_err := w.Write(success_response_json)
	if write_err != nil {
		fmt.Printf("error writing error response: %v\n", err)
	}
}
