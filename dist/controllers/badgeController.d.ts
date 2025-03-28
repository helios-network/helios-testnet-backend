import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
export declare const getAllBadges: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserBadges: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createBadge: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const assignBadgeToUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getBadgeDetails: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateBadge: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteBadge: (req: Request, res: Response, next: NextFunction) => Promise<void>;
