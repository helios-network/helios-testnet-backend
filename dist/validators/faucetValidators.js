"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFaucetEligibilityCheck = exports.validateFaucetTokenRequest = void 0;
const zod_1 = require("zod");
const FaucetClaim_1 = __importDefault(require("../models/FaucetClaim"));
const AVAILABLE_TOKENS = [
    {
        token: 'HLOS',
        chain: 'helios-testnet',
        maxClaimAmount: 100,
        cooldownHours: 24
    },
    {
        token: 'ETH',
        chain: 'goerli',
        maxClaimAmount: 0.1,
        cooldownHours: 24
    }
];
const validateFaucetTokenRequest = async (req, res, next) => {
    const FaucetTokenRequestSchema = zod_1.z.object({
        token: zod_1.z.string().refine((token) => AVAILABLE_TOKENS.some(t => t.token === token), { message: "Invalid token" }),
        chain: zod_1.z.string().refine((chain) => AVAILABLE_TOKENS.some(t => t.chain === chain), { message: "Invalid chain" }),
        amount: zod_1.z.number().positive()
    });
    try {
        const validatedData = FaucetTokenRequestSchema.parse(req.body);
        const tokenConfig = AVAILABLE_TOKENS.find(t => t.token === validatedData.token && t.chain === validatedData.chain);
        if (validatedData.amount > (tokenConfig?.maxClaimAmount || 0)) {
            return res.status(400).json({
                success: false,
                message: `Claim amount exceeds maximum for ${validatedData.token}`
            });
        }
        const isEligible = await FaucetClaim_1.default.isEligibleForClaim(req.user.wallet, validatedData.token, validatedData.chain);
        if (!isEligible) {
            return res.status(400).json({
                success: false,
                message: 'Not eligible for faucet claim. Check cooldown period.'
            });
        }
        req.body = validatedData;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid faucet token request',
                errors: error.errors
            });
        }
        next(error);
    }
};
exports.validateFaucetTokenRequest = validateFaucetTokenRequest;
const validateFaucetEligibilityCheck = async (req, res, next) => {
    const FaucetEligibilitySchema = zod_1.z.object({
        token: zod_1.z.string().refine((token) => AVAILABLE_TOKENS.some(t => t.token === token), { message: "Invalid token" }),
        chain: zod_1.z.string().refine((chain) => AVAILABLE_TOKENS.some(t => t.chain === chain), { message: "Invalid chain" })
    });
    try {
        const validatedData = FaucetEligibilitySchema.parse(req.body);
        req.body = validatedData;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid eligibility check request',
                errors: error.errors
            });
        }
        next(error);
    }
};
exports.validateFaucetEligibilityCheck = validateFaucetEligibilityCheck;
//# sourceMappingURL=faucetValidators.js.map