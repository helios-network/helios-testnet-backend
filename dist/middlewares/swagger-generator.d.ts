import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
interface ValidationConfig {
    body?: z.ZodType;
    query?: z.ZodType;
    params?: z.ZodType;
}
export declare function validateAndDocument(config: ValidationConfig): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
