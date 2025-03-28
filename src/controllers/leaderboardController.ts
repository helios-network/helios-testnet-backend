import { Request, Response } from 'express';
import User from '../models/User';
import XPActivity from '../models/XPActivity';
import { AuthRequest } from '../middlewares/auth';
import mongoose from 'mongoose';

// Global Leaderboard
export const getGlobalLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 50,
      timeframe = 'alltime' 
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    // Determine date filter based on timeframe
    let dateFilter = {};
    const now = new Date();
    switch (timeframe) {
      case 'daily':
        dateFilter = { 
          createdAt: { 
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) 
          } 
        };
        break;
      case 'weekly':
        dateFilter = { 
          createdAt: { 
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) 
          } 
        };
        break;
      case 'monthly':
        dateFilter = { 
          createdAt: { 
            $gte: new Date(now.getFullYear(), now.getMonth(), 1) 
          } 
        };
        break;
      default: // alltime
        dateFilter = {};
    }

    const leaderboard = await User.aggregate([
      // Match users based on date filter if applicable
      { $match: dateFilter },
      // Sort by XP in descending order
      { $sort: { xp: -1 } },
      // Pagination
      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum },
      // Project only necessary fields
      { 
        $project: {
          wallet: 1,
          username: 1,
          xp: 1,
          level: 1,
          contributorTag: 1,
          profilePicture: 1
        } 
      }
    ]);

    // Get total count for pagination
    const total = await User.countDocuments(dateFilter);

    res.status(200).json({
      success: true,
      leaderboard,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalUsers: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve global leaderboard',
      error: error.message
    });
  }
};

// Contributor Leaderboard
export const getContributorLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 50 
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const contributorLeaderboard = await User.aggregate([
      // Filter only users with contributor tags
      { $match: { contributorTag: { $ne: null } } },
      // Sort by contribution XP
      { $sort: { contributionXP: -1 } },
      // Pagination
      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum },
      // Project necessary fields
      { 
        $project: {
          wallet: 1,
          username: 1,
          contributorTag: 1,
          contributionXP: 1,
          profilePicture: 1
        } 
      }
    ]);

    // Get total count of contributors
    const total = await User.countDocuments({ contributorTag: { $ne: null } });

    res.status(200).json({
      success: true,
      contributorLeaderboard,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalContributors: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contributor leaderboard',
      error: error.message
    });
  }
};

// User's Leaderboard Rank
export const getUserLeaderboardRank = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    // Get user's global rank
    const globalRank = await User.aggregate([
      { $match: { xp: { $gt: req.user?.xp || 0 } } },
      { $count: 'rank' }
    ]);

    // Get user's contributor rank (if applicable)
    const contributorRank = req.user?.contributorTag 
      ? await User.aggregate([
          { $match: { 
            contributorTag: { $ne: null },
            contributionXP: { $gt: req.user?.contributionXP || 0 } 
          } },
          { $count: 'rank' }
        ])
      : null;

    res.status(200).json({
      success: true,
      globalRank: globalRank[0]?.rank + 1 || 1,
      contributorRank: contributorRank?.[0]?.rank + 1 || null,
      userXP: req.user?.xp,
      userContributionXP: req.user?.contributionXP
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user rank',
      error: error.message
    });
  }
};

// Leaderboard Statistics
export const getLeaderboardStats = async (req: AuthRequest, res: Response) => {
  try {
    // Aggregate leaderboard statistics
    const stats = await User.aggregate([
      // Overall stats
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalXP: { $sum: '$xp' },
          averageXP: { $avg: '$xp' },
          maxXP: { $max: '$xp' },
          
          // Contributor stats
          totalContributors: { 
            $sum: { $cond: [{ $ne: ['$contributorTag', null] }, 1, 0] } 
          },
          totalContributionXP: { $sum: '$contributionXP' },
          averageContributionXP: { $avg: '$contributionXP' }
        }
      }
    ]);

    // Recent XP activities
    const recentActivities = await XPActivity.aggregate([
      { $sort: { timestamp: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          amount: 1,
          type: 1,
          timestamp: 1,
          description: 1,
          userWallet: '$userDetails.wallet',
          username: '$userDetails.username'
        }
      }
    ]);

    res.status(200).json({
      success: true,
      overallStats: stats[0] || {},
      recentActivities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leaderboard statistics',
      error: error.message
    });
  }
};