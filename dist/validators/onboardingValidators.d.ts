import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
export declare const validateOnboardingStepStart: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const validateOnboardingStepCompletion: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const validateOnboardingRewardClaim: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
