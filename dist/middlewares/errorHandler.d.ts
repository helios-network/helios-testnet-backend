import { Request, Response, NextFunction } from 'express';
declare class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;
    constructor(message: string, statusCode: number);
}
declare const errorHandler: (err: AppError, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export { AppError, errorHandler };
