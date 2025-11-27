package config

import "go.mongodb.org/mongo-driver/v2/mongo"

type Config struct {
	Database DatabaseConfig
}

type DatabaseConfig struct {
	DB *mongo.Database
}

func (cfg *Config) LoadConfig() error {
	err := cfg.connectDB()
	if err != nil {
		return err
	}

	return nil
}
