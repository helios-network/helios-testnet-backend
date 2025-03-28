import { Request, Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import { SortOrder } from 'mongoose';

// Register a new user
export const registerUser = async (req: AuthRequest, res: Response) => {
  try {
    const { wallet } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ wallet: wallet.toLowerCase() });
    
    if (user) {
      return res.status(200).json({
        message: 'User already registered',
        user
      });
    }
    
    // Create new user
    user = new User({
      wallet: wallet.toLowerCase(),
      xp: 0,
      level: 1,
      onboardingSteps: [],
      contributorStatus: 'none'
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    
    const user = await User.findOne({ wallet: wallet.toLowerCase() })
      .select('-__v'); // Exclude version key
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
};

// Update user profile
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const wallet = req.user?.wallet;
    const updateData = req.body;
    
    const user = await User.findOneAndUpdate(
      { wallet: wallet?.toLowerCase() },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Profile update failed',
      error: error.message
    });
  }
};

// Get user stats
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    
    const user = await User.findOne({ wallet: wallet.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Fetch additional stats like XP history, badges, etc.
    const stats = {
      wallet: user.wallet,
      xp: user.xp,
      level: user.level,
      onboardingProgress: user.onboardingSteps.length,
      contributorStatus: user.contributorStatus
    };
    
    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user stats',
      error: error.message
    });
  }
};

// Search users (Admin)
// Search users (Admin)
export const searchUsers = async (req: Request, res: Response) => {
    try {
      const { 
        query = '', 
        page = 1, 
        limit = 10,
        sortBy = 'xp',
        sortOrder = 'desc'
      } = req.query;
      
      const options = {
        page: Number(page),
        limit: Number(limit),
        sort: { 
          [sortBy as string]: sortOrder === 'desc' ? -1 : 1 as SortOrder 
        }
      };
      
      // Validate sortBy to prevent potential injection
      const allowedSortFields = [
        'xp', 
        'createdAt', 
        'wallet', 
        'contributorTag', 
        'level'
      ];
      
      const sanitizedSortBy = allowedSortFields.includes(sortBy as string) 
        ? sortBy 
        : 'xp';
  
      const users = await User.find({
        $or: [
          { wallet: { $regex: query as string, $options: 'i' } },
          { contributorTag: { $regex: query as string, $options: 'i' } }
        ]
      })
      .select('-__v')
      .sort({ [sanitizedSortBy as string]: options.sort[sanitizedSortBy as string] })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);
      
      const total = await User.countDocuments({
        $or: [
          { wallet: { $regex: query as string, $options: 'i' } },
          { contributorTag: { $regex: query as string, $options: 'i' } }
        ]
      });
      
      res.status(200).json({
        success: true,
        users,
        pagination: {
          currentPage: options.page,
          totalPages: Math.ceil(total / options.limit),
          totalUsers: total
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'User search failed',
        error: error.message
      });
    }
  };

// Get user NFTs
export const getUserNFTs = async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    
    // This would typically involve querying blockchain or your NFT service
    const nfts: any[] = []; // Placeholder
    
    res.status(200).json({
      success: true,
      nfts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user NFTs',
      error: error.message
    });
  }
};