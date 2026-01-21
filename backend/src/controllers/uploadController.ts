import { Request, Response, NextFunction } from 'express';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';
import User from '../models/User';
import { AppError } from '../utils/errorHandler';
import { asyncHandler } from '../utils/errorHandler';
import { cacheDel, meKey } from '../utils/redisCache';

/**
 * @route   POST /api/auth/upload-profile-image
 * @desc    Upload profile image to Cloudinary
 * @access  Private
 */
export const uploadProfileImage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const userId = (req.user as any).userId;

    // Check if file exists
    if (!req.file) {
      throw new AppError('Please upload an image file', 400);
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    try {
      // Convert buffer to base64
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      // Upload to Cloudinary
      const result = await uploadToCloudinary(
        dataURI,
        `talentspal/profiles/${userId}`
      );

      // Delete old image if exists
      if (user.profileImage) {
        // Extract public_id from URL if it's a Cloudinary URL
        const urlParts = user.profileImage.split('/');
        const filename = urlParts[urlParts.length - 1].split('.')[0];
        const folder = urlParts.slice(-3, -1).join('/');
        const publicId = `${folder}/${filename}`;
        
        try {
          await deleteFromCloudinary(publicId);
        } catch (error) {
          console.error('Error deleting old image:', error);
          // Continue even if deletion fails
        }
      }

      // Update user's profile image
      user.profileImage = result.url;
      await user.save();

      // invalidate user's profile in cache
    await cacheDel(meKey(userId));

      res.status(200).json({
        success: true,
        message: 'Profile image uploaded successfully',
        data: {
          profileImage: result.url,
          publicId: result.publicId,
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
      throw new AppError('Failed to upload image', 500);
    }
  }
);

/**
 * @route   DELETE /api/auth/delete-profile-image
 * @desc    Delete profile image from Cloudinary
 * @access  Private
 */
export const deleteProfileImage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const userId = (req.user as any).userId;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.profileImage) {
      throw new AppError('No profile image to delete', 400);
    }

    try {
      // Extract public_id from Cloudinary URL
      const urlParts = user.profileImage.split('/');
      const filename = urlParts[urlParts.length - 1].split('.')[0];
      const folder = urlParts.slice(-3, -1).join('/');
      const publicId = `${folder}/${filename}`;

      // Delete from Cloudinary
      await deleteFromCloudinary(publicId);

      // Remove from user document
      user.profileImage = undefined;
      await user.save();

      // invalidate user's profile in cache
    await cacheDel(meKey(userId));

      res.status(200).json({
        success: true,
        message: 'Profile image deleted successfully',
      });
    } catch (error) {
      console.error('Delete error:', error);
      throw new AppError('Failed to delete image', 500);
    }
  }
);
