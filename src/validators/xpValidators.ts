import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth';
import XPActivity from '../models/XPActivity';
import User from '../models/User';
import config from '../config';

// Daily XP Claim Validator
export const validateDailyXPClaim = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;

    // Check last daily claim
    const lastClaim = await XPActivity.findOne({
      user: userId,
      type: 'daily_claim'
    }).sort({ timestamp: -1 });

    if (lastClaim) {
      const hoursSinceLastClaim = (
        Date.now() - lastClaim.timestamp.getTime()
      ) / (1000 * 60 * 60);

      if (hoursSinceLastClaim < 24) {
        return res.status(400).json({
          success: false,
          message: 'Daily XP can only be claimed once every 24 hours'
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Daily XP claim validation failed',
      error: error.message
    });
  }
};

// Activity Log Validator
export const validateActivityLog = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const ActivityLogSchema = z.object({
    activityType: z.enum([
      'tutorial_complete', 
      'contribution', 
      'referral'
    ]),
    metadata: z.record(z.string(), z.any()).optional()
  });

  try {
    const validatedData = ActivityLogSchema.parse(req.body);
    
    // Attach validated data
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity log',
        errors: error.errors
      });
    }
    next(error);
  }
};

// XP Transfer Validator
export const validateXPTransfer = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  const XPTransferSchema = z.object({
    recipientWallet: z.string(),
    amount: z.number()
      .int()
      .positive()
      .max(config.MAX_XP_TRANSFER || 100)
  });

  try {
    const validatedData = XPTransferSchema.parse(req.body);
    
    // Validate sender has enough XP
    const sender = req.user;
    if (!sender || sender.xp < validatedData.amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient XP for transfer'
      });
    }

    // Find recipient
    const recipient = await User.findOne({ 
      wallet: validatedData.recipientWallet.toLowerCase() 
    });

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Attach validated data and recipient
    req.body = {
      ...validatedData,
      recipientId: recipient._id
    };

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid XP transfer',
        errors: error.errors
      });
    }
    next(error);
  }
};