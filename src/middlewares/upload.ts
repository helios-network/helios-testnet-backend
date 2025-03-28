// middlewares/upload.ts
import multer, { 
    FileFilterCallback, 
    StorageEngine, 
    Multer, 
    MulterError 
  } from 'multer';
  import path from 'path';
  import fs from 'fs';
  import { Request, Response, NextFunction } from 'express';
  import { v4 as uuidv4 } from 'uuid';
  import { AppError } from '../middlewares/errorHandler';
  
  // Extend Express Request interface
  declare global {
    namespace Express {
      interface Request {
        file?: Multer.File;
        files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
      }
    }
  }
  
  // Define allowed file types
  const ALLOWED_FILE_TYPES = {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    videos: ['video/mp4', 'video/mpeg', 'video/quicktime'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg']
  };
  
  // Ensure upload directories exist
  const ensureDirectoryExists = (directory: string): void => {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  };
  
  // Create storage configuration
  const createStorage = (uploadPath: string): StorageEngine => {
    // Ensure upload directory exists
    ensureDirectoryExists(uploadPath);
  
    return multer.diskStorage({
      destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, uploadPath);
      },
      filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        // Generate unique filename
        const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      }
    });
  };
  
  // Create file filter
  const createFileFilter = (allowedTypes: string[]) => {
    return (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new AppError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`, 400));
      }
    };
  };
  
  // Upload middleware creator
  const createUploadMiddleware = (
    uploadPath: string, 
    allowedTypes: string[], 
    maxSize: number
  ): Multer => {
    return multer({
      storage: createStorage(uploadPath),
      fileFilter: createFileFilter(allowedTypes),
      limits: {
        fileSize: maxSize
      }
    });
  };
  
  // Create upload instances
  const uploadMiddlewares = {
    image: createUploadMiddleware(
      path.join(process.cwd(), 'uploads/images'),
      ALLOWED_FILE_TYPES.images,
      5 * 1024 * 1024 // 5MB
    ),
    document: createUploadMiddleware(
      path.join(process.cwd(), 'uploads/documents'),
      ALLOWED_FILE_TYPES.documents,
      10 * 1024 * 1024 // 10MB
    ),
    video: createUploadMiddleware(
      path.join(process.cwd(), 'uploads/videos'),
      ALLOWED_FILE_TYPES.videos,
      50 * 1024 * 1024 // 50MB
    ),
    audio: createUploadMiddleware(
      path.join(process.cwd(), 'uploads/audio'),
      ALLOWED_FILE_TYPES.audio,
      10 * 1024 * 1024 // 10MB
    )
  };
  
  // Error handling middleware
  export const uploadErrorHandler = (
    err: any, 
    req: Request, 
    res: Response, 
    next: NextFunction
  ) => {
    if (err instanceof MulterError) {
      // Multer-specific errors
      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          return res.status(400).json({
            success: false,
            message: 'File size is too large'
          });
        case 'LIMIT_FILE_COUNT':
          return res.status(400).json({
            success: false,
            message: 'Too many files uploaded'
          });
        case 'LIMIT_UNEXPECTED_FILE':
          return res.status(400).json({
            success: false,
            message: 'Unexpected file field'
          });
        default:
          return res.status(500).json({
            success: false,
            message: 'File upload error'
          });
      }
    } else if (err instanceof AppError) {
      // Custom app errors
      return res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    }
    
    // Pass to default error handler
    next(err);
  };
  
  // Cleanup utility for uploaded files
  export const cleanupUploadedFiles = (files?: Express.Multer.File | Express.Multer.File[]): void => {
    if (!files) return;
  
    const filesToCleanup = Array.isArray(files) ? files : [files];
    
    filesToCleanup.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error(`Failed to delete file ${file.path}:`, err);
      }
    });
  };
  
  // Export upload middlewares with single, array, and multiple methods
  export const uploadMiddleware = {
    single: (fieldName: string) => uploadMiddlewares.image.single(fieldName),
    array: (fieldName: string, maxCount?: number) => uploadMiddlewares.document.array(fieldName, maxCount),
    
    // Custom upload methods with specific types
    profileImage: (fieldName: string) => uploadMiddlewares.image.single(fieldName),
    resumeFile: (fieldName: string) => uploadMiddlewares.document.single(fieldName),
    
    // Optionally, create methods for other specific upload types
    multipleDocuments: (fieldName: string, maxCount: number = 5) => 
      uploadMiddlewares.document.array(fieldName, maxCount),
  };
  
  // Export allowed file types
  export const UPLOAD_TYPES = ALLOWED_FILE_TYPES;
  
  // File upload response interface
  export interface FileUploadResponse {
    success: boolean;
    data?: {
      filename: string;
      path: string;
      mimetype: string;
    };
    message?: string;
  }