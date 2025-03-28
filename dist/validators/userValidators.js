"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateContributorApplication = exports.validateProfileUpdate = exports.validateRegistration = void 0;
const zod_1 = require("zod");
const ethers_1 = require("ethers");
const User_1 = __importDefault(require("../models/User"));
const RegistrationSchema = zod_1.z.object({
    wallet: zod_1.z.string().refine((addr) => ethers_1.ethers.utils.isAddress(addr), { message: "Invalid Ethereum address" }),
    signature: zod_1.z.string(),
    referralCode: zod_1.z.string().optional()
});
const UpdateProfileSchema = zod_1.z.object({
    username: zod_1.z.string()
        .min(3, { message: "Username must be at least 3 characters" })
        .max(30, { message: "Username must be less than 30 characters" })
        .optional(),
    email: zod_1.z.string()
        .email({ message: "Invalid email address" })
        .optional(),
    avatar: zod_1.z.string()
        .url({ message: "Avatar must be a valid URL" })
        .optional(),
    bio: zod_1.z.string()
        .max(500, { message: "Bio must be less than 500 characters" })
        .optional(),
    socialLinks: zod_1.z.array(zod_1.z.object({
        platform: zod_1.z.string().min(1),
        url: zod_1.z.string().url()
    })).optional()
});
const ContributorApplicationSchema = zod_1.z.object({
    contributorTag: zod_1.z.string()
        .min(3, { message: "Contributor tag must be at least 3 characters" })
        .max(50, { message: "Contributor tag must be less than 50 characters" }),
    contributorLinks: zod_1.z.array(zod_1.z.string().url({ message: "Invalid URL in contributor links" })).min(1, { message: "At least one contribution link is required" }),
    expertise: zod_1.z.string()
        .max(200, { message: "Expertise description too long" })
        .optional()
});
const validateRegistration = async (req, res, next) => {
    try {
        const validatedData = RegistrationSchema.parse(req.body);
        const existingUser = await User_1.default.findOne({
            wallet: validatedData.wallet.toLowerCase()
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Wallet already registered'
            });
        }
        if (validatedData.referralCode) {
            const isValidReferral = await validateReferralCode(validatedData.referralCode);
            if (!isValidReferral) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid referral code'
                });
            }
        }
        req.body = validatedData;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        next(error);
    }
};
exports.validateRegistration = validateRegistration;
const validateProfileUpdate = async (req, res, next) => {
    try {
        const validatedData = UpdateProfileSchema.parse(req.body);
        if (validatedData.username) {
            const existingUser = await User_1.default.findOne({
                username: validatedData.username,
                wallet: { $ne: req.user?.wallet }
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Username already taken'
                });
            }
        }
        req.body = validatedData;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        next(error);
    }
};
exports.validateProfileUpdate = validateProfileUpdate;
const validateContributorApplication = async (req, res, next) => {
    try {
        const validatedData = ContributorApplicationSchema.parse(req.body);
        req.body = validatedData;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Contributor application validation failed',
                errors: error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        next(error);
    }
};
exports.validateContributorApplication = validateContributorApplication;
async function validateReferralCode(code) {
    return code === 'HELIOS2025';
}
//# sourceMappingURL=userValidators.js.map