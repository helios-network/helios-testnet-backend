import { z } from 'zod';
import { Model } from 'mongoose';
interface CRUDOptions {
    model: Model<any>;
    schemaValidation?: {
        create?: z.ZodObject<any>;
        update?: z.ZodObject<any>;
        query?: z.ZodObject<any>;
    };
    customMiddleware?: any[];
}
export declare function generateCRUDRoutes(resourceName: string, options: CRUDOptions): import("express-serve-static-core").Router;
export {};
