package api

import (
	"fmt"

	"github.com/spf13/viper"
)

type AppRequirements struct {
	Server     ServerRequirements
	Database   DatabaseRequirements
	Cloudinary CloudinaryRequirements
	SMTP       SMTPRequirements
	JWT        JWTRequirements
}

type ServerRequirements struct {
	Port        string
	BackendURL  string
	FrontendURL string
}

type DatabaseRequirements struct {
	MongoURI string
}

type CloudinaryRequirements struct {
	CloudName string
	APIKey    string
	APISecret string
}

type SMTPRequirements struct {
	SMTPHost  string
	SMTPPort  string
	SMTPUser  string
	SMTPPass  string
	EmailFrom string
	AppName   string
}

type JWTRequirements struct {
	JWTSecret           string
	JWTExpiresIn        string
	JWTRefreshExpiresIn string
}

func LoadRequirements() (*AppRequirements, error) {
	viper.SetConfigName(".env")
	viper.SetConfigType("env")
	viper.AddConfigPath(".")
	viper.AddConfigPath("../")
	viper.AddConfigPath("../../")

	// Read from .env file (if exists)
	if err := viper.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("set your environment variables in a .env file")
	}

	mongo_url := viper.GetString("MONGO_URI")
	if mongo_url == "" {
		return nil, fmt.Errorf("set your 'MONGO_URI' environment variable")
	}

	cloud_name := viper.GetString("CLOUDINARY_CLOUD_NAME")
	api_key := viper.GetString("CLOUDINARY_API_KEY")
	api_secret := viper.GetString("CLOUDINARY_API_SECRET")
	if cloud_name == "" || api_key == "" || api_secret == "" {
		return nil, fmt.Errorf("set your 'CLOUDINARY_CLOUD_NAME' & 'CLOUDINARY_API_KEY' & 'CLOUDINARY_API_SECRET' environment variables")
	}

	server_port := viper.GetString("PORT")
	backend_url := viper.GetString("BACKEND_URL")
	frontend_url := viper.GetString("FRONTEND_URL")
	if server_port == "" || backend_url == "" || frontend_url == "" {
		return nil, fmt.Errorf("set your 'PORT' & 'BACKEND_URL' & 'FRONTEND_URL' environment variables")
	}

	smtp_host := viper.GetString("SMTP_HOST")
	smtp_port := viper.GetString("SMTP_PORT")
	smtp_user := viper.GetString("SMTP_USER")
	smtp_pass := viper.GetString("SMTP_PASS")
	email_from := viper.GetString("EMAIL_FROM")
	app_name := viper.GetString("APP_NAME")
	if smtp_host == "" || smtp_port == "" || smtp_user == "" || smtp_pass == "" || email_from == "" || app_name == "" {
		return nil, fmt.Errorf("set your 'SMTP_HOST' & 'SMTP_PORT' & 'SMTP_USER' & 'SMTP_PASS & 'EMAIL_FROM' & 'APP_NAME' environment variables")
	}

	jwt_secret := viper.GetString("JWT_SECRET")
	jwt_expires_in := viper.GetString("JWT_EXPIRES_IN")
	jwt_refresh_expires_in := viper.GetString("JWT_REFRESH_EXPIRES_IN")
	if jwt_secret == "" {
		return nil, fmt.Errorf("set your 'JWT_SECRET' environment variables")
	}
	if jwt_expires_in == "" {
		jwt_expires_in = "1h"
	}
	if jwt_refresh_expires_in == "" {
		jwt_refresh_expires_in = "30d"
	}

	requirements := &AppRequirements{
		Server: ServerRequirements{
			Port:        server_port,
			BackendURL:  backend_url,
			FrontendURL: frontend_url,
		},
		Database: DatabaseRequirements{
			MongoURI: mongo_url,
		},
		Cloudinary: CloudinaryRequirements{
			CloudName: cloud_name,
			APIKey:    api_key,
			APISecret: api_secret,
		},
		SMTP: SMTPRequirements{
			SMTPHost:  smtp_host,
			SMTPPort:  smtp_port,
			SMTPUser:  smtp_user,
			SMTPPass:  smtp_pass,
			EmailFrom: email_from,
			AppName:   app_name,
		},
		JWT: JWTRequirements{
			JWTSecret:           jwt_secret,
			JWTExpiresIn:        jwt_expires_in,
			JWTRefreshExpiresIn: jwt_refresh_expires_in,
		},
	}

	return requirements, nil
}
