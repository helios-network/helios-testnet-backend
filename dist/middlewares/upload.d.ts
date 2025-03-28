import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            file?: Multer.File;
            files?: Multer.File[] | {
                [fieldname: string]: Multer.File[];
            };
        }
    }
}
export declare const uploadErrorHandler: (err: any, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const cleanupUploadedFiles: (files?: Express.Multer.File | Express.Multer.File[]) => void;
export declare const uploadMiddleware: {
    single: (fieldName: string) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    array: (fieldName: string, maxCount?: number) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    profileImage: (fieldName: string) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    resumeFile: (fieldName: string) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    multipleDocuments: (fieldName: string, maxCount?: number) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
};
export declare const UPLOAD_TYPES: {
    images: string[];
    documents: string[];
    videos: string[];
    audio: string[];
};
export interface FileUploadResponse {
    success: boolean;
    data?: {
        filename: string;
        path: string;
        mimetype: string;
    };
    message?: string;
}
