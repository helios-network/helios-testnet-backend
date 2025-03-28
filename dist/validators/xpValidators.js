"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateXPTransfer = exports.validateActivityLog = exports.validateDailyXPClaim = void 0;
const zod_1 = require("zod");
const XPActivity_1 = __importDefault(require("../models/XPActivity"));
const User_1 = __importDefault(require("../models/User"));
const config_1 = __importDefault(require("../config"));
const validateDailyXPClaim = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const lastClaim = await XPActivity_1.default.findOne({
            user: userId,
            type: 'daily_claim'
        }).sort({ timestamp: -1 });
        if (lastClaim) {
            const hoursSinceLastClaim = (Date.now() - lastClaim.timestamp.getTime()) / (1000 * 60 * 60);
            if (hoursSinceLastClaim < 24) {
                return res.status(400).json({
                    success: false,
                    message: 'Daily XP can only be claimed once every 24 hours'
                });
            }
        }
        next();
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Daily XP claim validation failed',
            error: error.message
        });
    }
};
exports.validateDailyXPClaim = validateDailyXPClaim;
const validateActivityLog = async (req, res, next) => {
    const ActivityLogSchema = zod_1.z.object({
        activityType: zod_1.z.enum([
            'tutorial_complete',
            'contribution',
            'referral'
        ]),
        metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional()
    });
    try {
        const validatedData = ActivityLogSchema.parse(req.body);
        req.body = validatedData;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid activity log',
                errors: error.errors
            });
        }
        next(error);
    }
};
exports.validateActivityLog = validateActivityLog;
const validateXPTransfer = async (req, res, next) => {
    const XPTransferSchema = zod_1.z.object({
        recipientWallet: zod_1.z.string(),
        amount: zod_1.z.number()
            .int()
            .positive()
            .max(config_1.default.MAX_XP_TRANSFER || 100)
    });
    try {
        const validatedData = XPTransferSchema.parse(req.body);
        const sender = req.user;
        if (!sender || sender.xp < validatedData.amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient XP for transfer'
            });
        }
        const recipient = await User_1.default.findOne({
            wallet: validatedData.recipientWallet.toLowerCase()
        });
        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: 'Recipient not found'
            });
        }
        req.body = {
            ...validatedData,
            recipientId: recipient._id
        };
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid XP transfer',
                errors: error.errors
            });
        }
        next(error);
    }
};
exports.validateXPTransfer = validateXPTransfer;
//# sourceMappingURL=xpValidators.js.map