import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import {IUser} from '../models/User';
import config from '../config';
import { JwtPayload, SignOptions } from 'jsonwebtoken';

// Extend Request type for authenticated routes
// Extend Request type for authenticated routes with file support
export interface AuthRequest extends Request {
    user?: IUser & { wallet: string };
}

export const protect = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token, 
      config.JWT_SECRET
    ) as { wallet: string };

    // Find user
    const user = await User.findOne({ 
      wallet: decoded.wallet.toLowerCase() 
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token is not valid',
      error: error.message
    });
  }
};

// Admin-only middleware
export const restrictToAdmin = (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  if (!req.user || req.user.contributorStatus !== 'approved') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin rights required.'
    });
  }
  next();
};

// JWT Token Generation
// Correctly typed token generation
export const generateToken = (wallet: string): string => {
    // Create a payload with the wallet
    const payload: JwtPayload = { 
      wallet 
    };
  
    // Define sign options
    const options: SignOptions = {
      expiresIn: Number(config.JWT_EXPIRES_IN)
    };
  
    // Sign the token
    return jwt.sign(
      payload, 
      config.JWT_SECRET, 
      options
    );
  };

// Wallet Signature Verification
export const verifyWalletSignature = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { wallet, signature } = req.body;

    if (!wallet || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Wallet and signature are required'
      });
    }

    // Implement wallet signature verification logic
    // This is a placeholder - replace with actual verification
    const isValidSignature = true; // Placeholder

    if (!isValidSignature) {
      return res.status(401).json({
        success: false,
        message: 'Invalid wallet signature'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Signature verification failed',
      error: error.message
    });
  }
};