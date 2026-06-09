import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Local Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.mp4'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, Images, and MP4 are allowed.'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Attempt to load Cloudinary dynamically (optional dependency)
let cloudinaryUploader = null;

const initCloudinary = async () => {
  const hasCredentials = process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (!hasCredentials) {
    console.log('Upload Middleware: Cloudinary not configured. Using local storage.');
    return;
  }

  try {
    const { v2: cloudinary } = await import('cloudinary');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    cloudinaryUploader = cloudinary.uploader;
    console.log('Upload Middleware: Cloudinary configured successfully.');
  } catch (err) {
    console.log('Upload Middleware: Cloudinary package not installed. Falling back to local storage.');
  }
};

// Initialize asynchronously (fire and forget, non-blocking)
initCloudinary();

/**
 * Handle file upload — uploads to Cloudinary if available, otherwise returns local path.
 * @param {Object} file - The multer file object (req.file)
 * @returns {Promise<string|null>} URL string or null
 */
export const handleUpload = async (file) => {
  if (!file) return null;

  if (cloudinaryUploader) {
    try {
      const result = await cloudinaryUploader.upload(file.path, {
        resource_type: 'auto',
        folder: 'smart_company_management'
      });
      // Remove local temp file after successful cloud upload
      try { fs.unlinkSync(file.path); } catch (_) {}
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error, falling back to local file:', error.message);
    }
  }

  // Return relative local path
  return `/uploads/${file.filename}`;
};
