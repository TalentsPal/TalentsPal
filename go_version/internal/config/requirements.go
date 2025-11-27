package config

import (
	"fmt"

	"github.com/spf13/viper"
)

type AppRequirements struct {
	Server     ServerConfig
	Database   DatabaseRequirements
	Cloudinary CloudinaryRequirements
}

type ServerConfig struct {
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

	requirements := &AppRequirements{
		Database: DatabaseRequirements{
			MongoURI: mongo_url,
		},
		Cloudinary: CloudinaryRequirements{
			CloudName: cloud_name,
			APIKey:    api_key,
			APISecret: api_secret,
		},
	}

	return requirements, nil
}
