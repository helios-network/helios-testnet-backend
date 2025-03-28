"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserNFTs = exports.searchUsers = exports.getUserStats = exports.updateUserProfile = exports.getUserProfile = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const registerUser = async (req, res) => {
    try {
        const { wallet } = req.body;
        let user = await User_1.default.findOne({ wallet: wallet.toLowerCase() });
        if (user) {
            return res.status(200).json({
                message: 'User already registered',
                user
            });
        }
        user = new User_1.default({
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};
exports.registerUser = registerUser;
const getUserProfile = async (req, res) => {
    try {
        const { wallet } = req.params;
        const user = await User_1.default.findOne({ wallet: wallet.toLowerCase() })
            .select('-__v');
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user profile',
            error: error.message
        });
    }
};
exports.getUserProfile = getUserProfile;
const updateUserProfile = async (req, res) => {
    try {
        const wallet = req.user?.wallet;
        const updateData = req.body;
        const user = await User_1.default.findOneAndUpdate({ wallet: wallet?.toLowerCase() }, { $set: updateData }, { new: true, runValidators: true });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Profile update failed',
            error: error.message
        });
    }
};
exports.updateUserProfile = updateUserProfile;
const getUserStats = async (req, res) => {
    try {
        const { wallet } = req.params;
        const user = await User_1.default.findOne({ wallet: wallet.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user stats',
            error: error.message
        });
    }
};
exports.getUserStats = getUserStats;
const searchUsers = async (req, res) => {
    try {
        const { query = '', page = 1, limit = 10, sortBy = 'xp', sortOrder = 'desc' } = req.query;
        const options = {
            page: Number(page),
            limit: Number(limit),
            sort: {
                [sortBy]: sortOrder === 'desc' ? -1 : 1
            }
        };
        const allowedSortFields = [
            'xp',
            'createdAt',
            'wallet',
            'contributorTag',
            'level'
        ];
        const sanitizedSortBy = allowedSortFields.includes(sortBy)
            ? sortBy
            : 'xp';
        const users = await User_1.default.find({
            $or: [
                { wallet: { $regex: query, $options: 'i' } },
                { contributorTag: { $regex: query, $options: 'i' } }
            ]
        })
            .select('-__v')
            .sort({ [sanitizedSortBy]: options.sort[sanitizedSortBy] })
            .skip((options.page - 1) * options.limit)
            .limit(options.limit);
        const total = await User_1.default.countDocuments({
            $or: [
                { wallet: { $regex: query, $options: 'i' } },
                { contributorTag: { $regex: query, $options: 'i' } }
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'User search failed',
            error: error.message
        });
    }
};
exports.searchUsers = searchUsers;
const getUserNFTs = async (req, res) => {
    try {
        const { wallet } = req.params;
        const nfts = [];
        res.status(200).json({
            success: true,
            nfts
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user NFTs',
            error: error.message
        });
    }
};
exports.getUserNFTs = getUserNFTs;
//# sourceMappingURL=userController.js.map