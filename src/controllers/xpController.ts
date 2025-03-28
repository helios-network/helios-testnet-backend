import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import User from '../models/User';
import XPActivity, { XPActivityType } from '../models/XPActivity';
import config from '../config';

// Claim Daily XP
export const claimDailyXP = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const dailyXPAmount = config.DAILY_XP_AMOUNT || 50;

    // Log XP activity
    await XPActivity.logActivity(
      user!._id, 
      dailyXPAmount, 
      XPActivityType.DAILY_CLAIM,
      'Daily XP Reward'
    );

    // Update user XP
    user!.xp += dailyXPAmount;
    await user!.save();

    res.status(200).json({
      success: true,
      message: 'Daily XP claimed successfully',
      xpEarned: dailyXPAmount,
      totalXP: user!.xp
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to claim daily XP',
      error: error.message
    });
  }
};

// Log Activity XP
export const logActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { activityType, metadata } = req.body;
    const user = req.user;

    let xpAmount = 0;
    switch (activityType) {
      case 'tutorial_complete':
        xpAmount = 100;
        break;
      case 'contribution':
        xpAmount = 75;
        break;
      case 'referral':
        xpAmount = 50;
        break;
    }

    await XPActivity.logActivity(
      user!._id, 
      xpAmount, 
      activityType,
      `XP for ${activityType}`,
      metadata
    );

    user!.xp += xpAmount;
    await user!.save();

    res.status(200).json({
      success: true,
      message: 'Activity logged successfully',
      xpEarned: xpAmount,
      totalXP: user!.xp
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to log activity',
      error: error.message
    });
  }
};

// Transfer XP
export const transferXP = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, recipientId } = req.body;
    const sender = req.user;

    // Deduct XP from sender
    sender!.xp -= amount;
    await sender!.save();

    // Log transfer for sender
    await XPActivity.logActivity(
      sender!._id, 
      -amount, 
      XPActivityType.TRANSFER,
      'XP Transfer Out',
      {},
      recipientId
    );

    // Find and update recipient
    const recipient = await User.findById(recipientId);
    recipient!.xp += amount;
    await recipient!.save();

    // Log transfer for recipient
    await XPActivity.logActivity(
      recipient!._id, 
      amount, 
      XPActivityType.TRANSFER,
      'XP Transfer In',
      {},
      sender!._id
    );

    res.status(200).json({
      success: true,
      message: 'XP transferred successfully',
      transferAmount: amount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to transfer XP',
      error: error.message
    });
  }
};

// Get XP Leaderboard
export const getXPLeaderboard = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 100, 
      timeframe = 'allTime' 
    } = req.query;

    const options = {
      page: Number(page),
      limit: Number(limit)
    };

    const users = await User.find()
      .sort({ xp: -1 })
      .select('wallet username xp level')
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      leaderboard: users,
      pagination: {
        currentPage: options.page,
        totalPages: Math.ceil(total / options.limit),
        totalUsers: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leaderboard',
      error: error.message
    });
  }
};

// Get User XP History
export const getUserXPHistory = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { 
      page = 1, 
      limit = 50, 
      type 
    } = req.query;

    const options = {
      page: Number(page),
      limit: Number(limit)
    };

    const query: { user: any; type?: string } = { user: user!._id };
    if (type) {
      query.type = type as string;
    }

    const activities = await XPActivity.find(query)
      .sort({ timestamp: -1 })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);

    const total = await XPActivity.countDocuments(query);

    res.status(200).json({
      success: true,
      xpHistory: activities,
      pagination: {
        currentPage: options.page,
        totalPages: Math.ceil(total / options.limit),
        totalActivities: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve XP history',
      error: error.message
    });
  }
};