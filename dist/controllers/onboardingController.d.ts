import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
export declare const startOnboardingStep: (req: AuthRequest, res: Response) => Promise<void>;
export declare const completeOnboardingStep: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getOnboardingProgress: (req: AuthRequest, res: Response) => Promise<void>;
export declare const resetOnboardingStep: (userId: string, stepKey: string) => Promise<import("mongoose").ModifyResult<import("mongoose").Document<unknown, {}, import("../models/OnboardingStep").IOnboardingStep> & import("../models/OnboardingStep").IOnboardingStep & {
    _id: import("mongoose").Types.ObjectId;
}>>;
export declare const claimOnboardingReward: (req: AuthRequest, res: Response) => Promise<void>;
