package main

import (
	"log"
	"net/http"
	"time"

	"go_version/internal/api"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	app_requirements, err := api.LoadRequirements()
	if err != nil {
		log.Fatal("error while loading app requirements: " + err.Error())
	}

	app_config := api.AppConfig{
		REQUIREMENTS: app_requirements,
	}
	err = app_config.LoadConfig()
	if err != nil {
		log.Fatal("error while loading app configs: " + err.Error())
	}

	router := chi.NewRouter()

	// Same origin: http://localhost:8080 → http://localhost:8080
	// Cross origin: http://localhost:3000 → http://localhost:8080
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	router.Use(middleware.CleanPath) // /api/v1/catalog///topic => /api/v1/catalog/topic
	router.Use(middleware.Recoverer) // recovers from panics that can happen in routes/handlers
	// router.Get("/health", api_config.HealthHandler)
	router.Route("/api/auth", func(r chi.Router) {
		r.Post("/signup", app_config.Handle(app_config.SignupHandler))
		r.Post("/login", app_config.Handle(app_config.LoginHandler))
		r.Get("/verify-email/{token}", app_config.Handle(app_config.VerifyEmailHandler))
		r.Get("/me", app_config.Handle(app_config.MiddlewareAuthorize(app_config.GetUserProfile)))
	})

	srv := &http.Server{
		Addr:              ":" + app_requirements.Server.Port,
		Handler:           router,
		ReadHeaderTimeout: 15 * time.Second,
	}

	log.Printf("Serving on port: %s\n", app_requirements.Server.Port)
	log.Fatal(srv.ListenAndServe())
}
