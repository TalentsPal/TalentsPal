package config

import (
	"context"
	"fmt"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func (cfg *Config) connectDB() error {
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		return fmt.Errorf("set your 'MONGODB_URI' environment variable")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(options.Client().ApplyURI(uri).SetTimeout(10 * time.Second))
	if err != nil {
		return fmt.Errorf("failed to connect to MongoDB: %w", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		return fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	cfg.Database.DB = client.Database("talentspal")

	return nil
}
