"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboardStats = exports.getUserLeaderboardRank = exports.getContributorLeaderboard = exports.getGlobalLeaderboard = void 0;
const User_1 = __importDefault(require("../models/User"));
const XPActivity_1 = __importDefault(require("../models/XPActivity"));
const getGlobalLeaderboard = async (req, res) => {
    try {
        const { page = 1, limit = 50, timeframe = 'alltime' } = req.query;
        const pageNum = Number(page);
        const limitNum = Number(limit);
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
            default:
                dateFilter = {};
        }
        const leaderboard = await User_1.default.aggregate([
            { $match: dateFilter },
            { $sort: { xp: -1 } },
            { $skip: (pageNum - 1) * limitNum },
            { $limit: limitNum },
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
        const total = await User_1.default.countDocuments(dateFilter);
        res.status(200).json({
            success: true,
            leaderboard,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalUsers: total
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve global leaderboard',
            error: error.message
        });
    }
};
exports.getGlobalLeaderboard = getGlobalLeaderboard;
const getContributorLeaderboard = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const contributorLeaderboard = await User_1.default.aggregate([
            { $match: { contributorTag: { $ne: null } } },
            { $sort: { contributionXP: -1 } },
            { $skip: (pageNum - 1) * limitNum },
            { $limit: limitNum },
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
        const total = await User_1.default.countDocuments({ contributorTag: { $ne: null } });
        res.status(200).json({
            success: true,
            contributorLeaderboard,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalContributors: total
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve contributor leaderboard',
            error: error.message
        });
    }
};
exports.getContributorLeaderboard = getContributorLeaderboard;
const getUserLeaderboardRank = async (req, res) => {
    try {
        const userId = req.user?._id;
        const globalRank = await User_1.default.aggregate([
            { $match: { xp: { $gt: req.user?.xp || 0 } } },
            { $count: 'rank' }
        ]);
        const contributorRank = req.user?.contributorTag
            ? await User_1.default.aggregate([
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user rank',
            error: error.message
        });
    }
};
exports.getUserLeaderboardRank = getUserLeaderboardRank;
const getLeaderboardStats = async (req, res) => {
    try {
        const stats = await User_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    totalXP: { $sum: '$xp' },
                    averageXP: { $avg: '$xp' },
                    maxXP: { $max: '$xp' },
                    totalContributors: {
                        $sum: { $cond: [{ $ne: ['$contributorTag', null] }, 1, 0] }
                    },
                    totalContributionXP: { $sum: '$contributionXP' },
                    averageContributionXP: { $avg: '$contributionXP' }
                }
            }
        ]);
        const recentActivities = await XPActivity_1.default.aggregate([
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve leaderboard statistics',
            error: error.message
        });
    }
};
exports.getLeaderboardStats = getLeaderboardStats;
//# sourceMappingURL=leaderboardController.js.map