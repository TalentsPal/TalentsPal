package api

import (
	"github.com/cloudinary/cloudinary-go/v2"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type AppConfig struct {
	DATABASE     *mongo.Database
	CLOUDINARY   *cloudinary.Cloudinary
	REQUIREMENTS *AppRequirements
}

func (cfg *AppConfig) LoadConfig() error {
	err := cfg.connectDB(cfg.REQUIREMENTS.Database.MongoURI)
	if err != nil {
		return err
	}

	err = cfg.initCloudinary(cfg.REQUIREMENTS.Cloudinary.CloudName, cfg.REQUIREMENTS.Cloudinary.APIKey, cfg.REQUIREMENTS.Cloudinary.APISecret)
	if err != nil {
		return err
	}

	return nil
}
