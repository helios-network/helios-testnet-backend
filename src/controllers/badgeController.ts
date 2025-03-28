import { Request, Response, NextFunction } from 'express';
import Badge, { BadgeRarity, BadgeType } from '../models/Badge';
import User from '../models/User';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';

// Get all badges
export const getAllBadges = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { 
      type, 
      rarity, 
      page = 1, 
      limit = 10 
    } = req.query;

    const filter: any = {};
    if (type) filter.type = type;
    if (rarity) filter.rarity = rarity;

    const badges = await Badge.find(filter)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Badge.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: badges.length,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalBadges: total
      },
      data: badges
    });
  } catch (error) {
    next(new AppError('Failed to retrieve badges', 500));
  }
};

// Get user's badges
export const getUserBadges = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id).populate('badges');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      count: user.badges.length,
      data: user.badges
    });
  } catch (error) {
    next(new AppError('Failed to retrieve user badges', 500));
  }
};

// Create a new badge
export const createBadge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      name, 
      description, 
      imageUrl, 
      rarity = BadgeRarity.COMMON,
      type = BadgeType.ACHIEVEMENT,
      requiredCondition,
      xpReward = 0
    } = req.body;

    const badge = await Badge.create({
      name,
      description,
      imageUrl,
      rarity,
      type,
      requiredCondition,
      xpReward
    });

    res.status(201).json({
      success: true,
      data: badge
    });
  } catch (error) {
    next(new AppError('Failed to create badge', 500));
  }
};

// Assign badge to user
export const assignBadgeToUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, badgeId } = req.body;

    const user = await User.findById(userId);
    const badge = await Badge.findById(badgeId);

    if (!user || !badge) {
      return next(new AppError('User or Badge not found', 404));
    }

    // Check if user already has the badge
    if (user.badges.includes(badgeId)) {
      return next(new AppError('User already has this badge', 400));
    }

    // Assign badge and update user's XP
    user.badges.push(badgeId);
    user.xp += (badge.xpReward) ? badge.xpReward : 0;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Badge assigned successfully',
      data: {
        badge,
        xpEarned: badge.xpReward
      }
    });
  } catch (error) {
    next(new AppError('Failed to assign badge', 500));
  }
};

// Get badge details
export const getBadgeDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const badge = await Badge.findById(req.params.id);

    if (!badge) {
      return next(new AppError('Badge not found', 404));
    }

    res.status(200).json({
      success: true,
      data: badge
    });
  } catch (error) {
    next(new AppError('Failed to retrieve badge details', 500));
  }
};

// Update badge
export const updateBadge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const badge = await Badge.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!badge) {
      return next(new AppError('Badge not found', 404));
    }

    res.status(200).json({
      success: true,
      data: badge
    });
  } catch (error) {
    next(new AppError('Failed to update badge', 500));
  }
};

// Delete badge
export const deleteBadge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const badge = await Badge.findByIdAndDelete(req.params.id);

    if (!badge) {
      return next(new AppError('Badge not found', 404));
    }

    res.status(204).json({
      success: true,
      data: null
    });
  } catch (error) {
    next(new AppError('Failed to delete badge', 500));
  }
};