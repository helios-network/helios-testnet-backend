import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
export declare const requestFaucetTokens: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getFaucetClaimHistory: (req: AuthRequest, res: Response) => Promise<void>;
export declare const checkFaucetEligibility: (req: AuthRequest, res: Response) => Promise<void>;
