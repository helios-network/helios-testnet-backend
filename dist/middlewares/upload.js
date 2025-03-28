"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPLOAD_TYPES = exports.uploadMiddleware = exports.cleanupUploadedFiles = exports.uploadErrorHandler = void 0;
const multer_1 = __importStar(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const errorHandler_1 = require("../middlewares/errorHandler");
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
const ensureDirectoryExists = (directory) => {
    if (!fs_1.default.existsSync(directory)) {
        fs_1.default.mkdirSync(directory, { recursive: true });
    }
};
const createStorage = (uploadPath) => {
    ensureDirectoryExists(uploadPath);
    return multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${(0, uuid_1.v4)()}`;
            const ext = path_1.default.extname(file.originalname);
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        }
    });
};
const createFileFilter = (allowedTypes) => {
    return (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new errorHandler_1.AppError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`, 400));
        }
    };
};
const createUploadMiddleware = (uploadPath, allowedTypes, maxSize) => {
    return (0, multer_1.default)({
        storage: createStorage(uploadPath),
        fileFilter: createFileFilter(allowedTypes),
        limits: {
            fileSize: maxSize
        }
    });
};
const uploadMiddlewares = {
    image: createUploadMiddleware(path_1.default.join(process.cwd(), 'uploads/images'), ALLOWED_FILE_TYPES.images, 5 * 1024 * 1024),
    document: createUploadMiddleware(path_1.default.join(process.cwd(), 'uploads/documents'), ALLOWED_FILE_TYPES.documents, 10 * 1024 * 1024),
    video: createUploadMiddleware(path_1.default.join(process.cwd(), 'uploads/videos'), ALLOWED_FILE_TYPES.videos, 50 * 1024 * 1024),
    audio: createUploadMiddleware(path_1.default.join(process.cwd(), 'uploads/audio'), ALLOWED_FILE_TYPES.audio, 10 * 1024 * 1024)
};
const uploadErrorHandler = (err, req, res, next) => {
    if (err instanceof multer_1.MulterError) {
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
    }
    else if (err instanceof errorHandler_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }
    next(err);
};
exports.uploadErrorHandler = uploadErrorHandler;
const cleanupUploadedFiles = (files) => {
    if (!files)
        return;
    const filesToCleanup = Array.isArray(files) ? files : [files];
    filesToCleanup.forEach(file => {
        try {
            fs_1.default.unlinkSync(file.path);
        }
        catch (err) {
            console.error(`Failed to delete file ${file.path}:`, err);
        }
    });
};
exports.cleanupUploadedFiles = cleanupUploadedFiles;
exports.uploadMiddleware = {
    single: (fieldName) => uploadMiddlewares.image.single(fieldName),
    array: (fieldName, maxCount) => uploadMiddlewares.document.array(fieldName, maxCount),
    profileImage: (fieldName) => uploadMiddlewares.image.single(fieldName),
    resumeFile: (fieldName) => uploadMiddlewares.document.single(fieldName),
    multipleDocuments: (fieldName, maxCount = 5) => uploadMiddlewares.document.array(fieldName, maxCount),
};
exports.UPLOAD_TYPES = ALLOWED_FILE_TYPES;
//# sourceMappingURL=upload.js.map