"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserXPHistory = exports.getXPLeaderboard = exports.transferXP = exports.logActivity = exports.claimDailyXP = void 0;
const User_1 = __importDefault(require("../models/User"));
const XPActivity_1 = __importStar(require("../models/XPActivity"));
const config_1 = __importDefault(require("../config"));
const claimDailyXP = async (req, res) => {
    try {
        const user = req.user;
        const dailyXPAmount = config_1.default.DAILY_XP_AMOUNT || 50;
        await XPActivity_1.default.logActivity(user._id, dailyXPAmount, XPActivity_1.XPActivityType.DAILY_CLAIM, 'Daily XP Reward');
        user.xp += dailyXPAmount;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Daily XP claimed successfully',
            xpEarned: dailyXPAmount,
            totalXP: user.xp
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to claim daily XP',
            error: error.message
        });
    }
};
exports.claimDailyXP = claimDailyXP;
const logActivity = async (req, res) => {
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
        await XPActivity_1.default.logActivity(user._id, xpAmount, activityType, `XP for ${activityType}`, metadata);
        user.xp += xpAmount;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Activity logged successfully',
            xpEarned: xpAmount,
            totalXP: user.xp
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to log activity',
            error: error.message
        });
    }
};
exports.logActivity = logActivity;
const transferXP = async (req, res) => {
    try {
        const { amount, recipientId } = req.body;
        const sender = req.user;
        sender.xp -= amount;
        await sender.save();
        await XPActivity_1.default.logActivity(sender._id, -amount, XPActivity_1.XPActivityType.TRANSFER, 'XP Transfer Out', {}, recipientId);
        const recipient = await User_1.default.findById(recipientId);
        recipient.xp += amount;
        await recipient.save();
        await XPActivity_1.default.logActivity(recipient._id, amount, XPActivity_1.XPActivityType.TRANSFER, 'XP Transfer In', {}, sender._id);
        res.status(200).json({
            success: true,
            message: 'XP transferred successfully',
            transferAmount: amount
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to transfer XP',
            error: error.message
        });
    }
};
exports.transferXP = transferXP;
const getXPLeaderboard = async (req, res) => {
    try {
        const { page = 1, limit = 100, timeframe = 'allTime' } = req.query;
        const options = {
            page: Number(page),
            limit: Number(limit)
        };
        const users = await User_1.default.find()
            .sort({ xp: -1 })
            .select('wallet username xp level')
            .skip((options.page - 1) * options.limit)
            .limit(options.limit);
        const total = await User_1.default.countDocuments();
        res.status(200).json({
            success: true,
            leaderboard: users,
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
            message: 'Failed to retrieve leaderboard',
            error: error.message
        });
    }
};
exports.getXPLeaderboard = getXPLeaderboard;
const getUserXPHistory = async (req, res) => {
    try {
        const user = req.user;
        const { page = 1, limit = 50, type } = req.query;
        const options = {
            page: Number(page),
            limit: Number(limit)
        };
        const query = { user: user._id };
        if (type) {
            query.type = type;
        }
        const activities = await XPActivity_1.default.find(query)
            .sort({ timestamp: -1 })
            .skip((options.page - 1) * options.limit)
            .limit(options.limit);
        const total = await XPActivity_1.default.countDocuments(query);
        res.status(200).json({
            success: true,
            xpHistory: activities,
            pagination: {
                currentPage: options.page,
                totalPages: Math.ceil(total / options.limit),
                totalActivities: total
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve XP history',
            error: error.message
        });
    }
};
exports.getUserXPHistory = getUserXPHistory;
//# sourceMappingURL=xpController.js.map