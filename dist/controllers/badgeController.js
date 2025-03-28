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
exports.deleteBadge = exports.updateBadge = exports.getBadgeDetails = exports.assignBadgeToUser = exports.createBadge = exports.getUserBadges = exports.getAllBadges = void 0;
const Badge_1 = __importStar(require("../models/Badge"));
const User_1 = __importDefault(require("../models/User"));
const errorHandler_1 = require("../middlewares/errorHandler");
const getAllBadges = async (req, res, next) => {
    try {
        const { type, rarity, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (type)
            filter.type = type;
        if (rarity)
            filter.rarity = rarity;
        const badges = await Badge_1.default.find(filter)
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await Badge_1.default.countDocuments(filter);
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
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to retrieve badges', 500));
    }
};
exports.getAllBadges = getAllBadges;
const getUserBadges = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user?._id).populate('badges');
        if (!user) {
            return next(new errorHandler_1.AppError('User not found', 404));
        }
        res.status(200).json({
            success: true,
            count: user.badges.length,
            data: user.badges
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to retrieve user badges', 500));
    }
};
exports.getUserBadges = getUserBadges;
const createBadge = async (req, res, next) => {
    try {
        const { name, description, imageUrl, rarity = Badge_1.BadgeRarity.COMMON, type = Badge_1.BadgeType.ACHIEVEMENT, requiredCondition, xpReward = 0 } = req.body;
        const badge = await Badge_1.default.create({
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
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to create badge', 500));
    }
};
exports.createBadge = createBadge;
const assignBadgeToUser = async (req, res, next) => {
    try {
        const { userId, badgeId } = req.body;
        const user = await User_1.default.findById(userId);
        const badge = await Badge_1.default.findById(badgeId);
        if (!user || !badge) {
            return next(new errorHandler_1.AppError('User or Badge not found', 404));
        }
        if (user.badges.includes(badgeId)) {
            return next(new errorHandler_1.AppError('User already has this badge', 400));
        }
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
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to assign badge', 500));
    }
};
exports.assignBadgeToUser = assignBadgeToUser;
const getBadgeDetails = async (req, res, next) => {
    try {
        const badge = await Badge_1.default.findById(req.params.id);
        if (!badge) {
            return next(new errorHandler_1.AppError('Badge not found', 404));
        }
        res.status(200).json({
            success: true,
            data: badge
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to retrieve badge details', 500));
    }
};
exports.getBadgeDetails = getBadgeDetails;
const updateBadge = async (req, res, next) => {
    try {
        const badge = await Badge_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!badge) {
            return next(new errorHandler_1.AppError('Badge not found', 404));
        }
        res.status(200).json({
            success: true,
            data: badge
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to update badge', 500));
    }
};
exports.updateBadge = updateBadge;
const deleteBadge = async (req, res, next) => {
    try {
        const badge = await Badge_1.default.findByIdAndDelete(req.params.id);
        if (!badge) {
            return next(new errorHandler_1.AppError('Badge not found', 404));
        }
        res.status(204).json({
            success: true,
            data: null
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to delete badge', 500));
    }
};
exports.deleteBadge = deleteBadge;
//# sourceMappingURL=badgeController.js.map