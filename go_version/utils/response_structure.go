package utils

type Response struct {
	Success bool              `json:"success"`
	Message string            `json:"message"`
	Data    any               `json:"data,omitempty"`
	Errors  map[string]string `json:"errors,omitempty"`
	Error   string            `json:"error,omitempty"`
	Stack   string            `json:"stack,omitempty"`
}
