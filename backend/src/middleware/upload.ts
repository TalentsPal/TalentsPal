import multer from 'multer';
import { Request } from 'express';

/**
 * Multer Configuration for File Uploads
 */

// Configure multer to use memory storage (file buffer)
const storage = multer.memoryStorage();

// File filter to accept only images
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

export default upload;
