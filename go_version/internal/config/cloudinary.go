package config

import (
	"fmt"

	"github.com/cloudinary/cloudinary-go/v2"
)

func (cfg *AppConfig) initCloudinary(cloud_name, api_key, api_secret string) error {
	cld, err := cloudinary.NewFromParams(
		cloud_name,
		api_key,
		api_secret,
	)
	if err != nil {
		return fmt.Errorf("failed to initialize Cloudinary: %w", err)
	}

	cld.Config.URL.Secure = true

	cfg.CLOUDINARY = cld

	return nil
}
