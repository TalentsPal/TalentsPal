package config

import (
	"context"
	"fmt"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
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

func (cfg *AppConfig) UploadImageToCloudinary(ctx context.Context, file interface{}, folder string) (*uploader.UploadResult, error) {
	destination := "talentspal/"
	if folder == "" {
		destination += "extras"
	} else {
		destination += folder
	}

	// Upload the image.
	// Allow overwriting the asset with new versions
	resp, err := cfg.CLOUDINARY.Upload.Upload(ctx, file, uploader.UploadParams{
		UniqueFilename: api.Bool(false),
		Overwrite:      api.Bool(true),
		Folder:         folder,
		ResourceType:   "auto",
		Transformation: "w_500,h_500,c_fill,g_face,q_auto,f_auto"})
	if err != nil {
		return nil, fmt.Errorf("failed to upload to Cloudinary: %w", err)
	}

	return resp, nil
}

func (cfg *AppConfig) DeleteImageFromCloudinary(ctx context.Context, publicID string) error {
	_, err := cfg.CLOUDINARY.Upload.Destroy(ctx, uploader.DestroyParams{
		PublicID: publicID,
	})

	if err != nil {
		return fmt.Errorf("failed to delete from Cloudinary: %w", err)
	}

	return nil
}
