import { v2 as cloudinary } from 'cloudinary';

/**
 * Cloudinary Configuration
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param file - File buffer or path
 * @param folder - Cloudinary folder name
 * @returns Upload result with URL
 */
export const uploadToCloudinary = async (
  file: string,
  folder: string = 'talentspal/profiles'
): Promise<{ url: string; publicId: string }> => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Delete image from Cloudinary
 * @param publicId - Public ID of the image
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

/**
 * Upload profile image from Google OAuth
 * @param imageUrl - Google profile image URL
 * @param userId - User ID for folder organization
 */
export const uploadGoogleProfileImage = async (
  imageUrl: string,
  userId: string
): Promise<{ url: string; publicId: string }> => {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: `talentspal/profiles/${userId}`,
      resource_type: 'image',
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Google profile image upload error:', error);
    // Don't throw error, just return empty - profile image is optional
    return { url: '', publicId: '' };
  }
};

export default cloudinary;
