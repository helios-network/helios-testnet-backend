import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
export declare const claimDailyXP: (req: AuthRequest, res: Response) => Promise<void>;
export declare const logActivity: (req: AuthRequest, res: Response) => Promise<void>;
export declare const transferXP: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getXPLeaderboard: (req: Request, res: Response) => Promise<void>;
export declare const getUserXPHistory: (req: AuthRequest, res: Response) => Promise<void>;
