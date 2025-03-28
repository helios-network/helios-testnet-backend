import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
export declare const validateFaucetTokenRequest: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const validateFaucetEligibilityCheck: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
