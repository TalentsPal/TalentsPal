package api

import (
	"github.com/cloudinary/cloudinary-go/v2"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type AppConfig struct {
	DATABASE   *mongo.Database
	CLOUDINARY *cloudinary.Cloudinary
}

func (cfg *AppConfig) LoadConfig(requirements *AppRequirements) error {
	err := cfg.connectDB(requirements.Database.MongoURI)
	if err != nil {
		return err
	}

	err = cfg.initCloudinary(requirements.Cloudinary.CloudName, requirements.Cloudinary.APIKey, requirements.Cloudinary.APISecret)
	if err != nil {
		return err
	}

	return nil
}
