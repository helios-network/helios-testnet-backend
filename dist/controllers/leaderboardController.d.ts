import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
export declare const getGlobalLeaderboard: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getContributorLeaderboard: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUserLeaderboardRank: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getLeaderboardStats: (req: AuthRequest, res: Response) => Promise<void>;
