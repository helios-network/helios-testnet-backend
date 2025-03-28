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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFaucetEligibility = exports.getFaucetClaimHistory = exports.requestFaucetTokens = void 0;
const FaucetClaim_1 = __importStar(require("../models/FaucetClaim"));
const XPActivity_1 = __importStar(require("../models/XPActivity"));
const faucetService_1 = require("../services/faucetService");
const requestFaucetTokens = async (req, res) => {
    try {
        const { token, chain, amount } = req.body;
        const user = req.user;
        const faucetClaim = await FaucetClaim_1.default.createClaim(user._id, user.wallet, amount, token, chain);
        try {
            const transactionResult = await (0, faucetService_1.sendTokensFromFaucet)(user.wallet, token, chain, amount);
            faucetClaim.status = FaucetClaim_1.FaucetClaimStatus.COMPLETED;
            faucetClaim.transactionHash = transactionResult.transactionHash;
            await faucetClaim.save();
            const xpReward = (0, faucetService_1.calculateFaucetReward)(amount, token);
            await XPActivity_1.default.logActivity(user._id, xpReward, XPActivity_1.XPActivityType.FAUCET_CLAIM, `Faucet claim: ${amount} ${token}`);
            user.xp += xpReward;
            await user.save();
            res.status(200).json({
                success: true,
                message: 'Faucet tokens claimed successfully',
                faucetClaim,
                xpReward,
                transactionHash: transactionResult.transactionHash
            });
        }
        catch (sendError) {
            faucetClaim.status = FaucetClaim_1.FaucetClaimStatus.FAILED;
            faucetClaim.errorMessage = sendError.message;
            await faucetClaim.save();
            res.status(400).json({
                success: false,
                message: 'Failed to send faucet tokens',
                error: sendError.message
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Faucet token request failed',
            error: error.message
        });
    }
};
exports.requestFaucetTokens = requestFaucetTokens;
const getFaucetClaimHistory = async (req, res) => {
    try {
        const { page = 1, limit = 50, status } = req.query;
        const options = {
            page: Number(page),
            limit: Number(limit)
        };
        const query = {
            user: req.user?._id
        };
        if (status) {
            query.status = status;
        }
        const faucetClaims = await FaucetClaim_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip((options.page - 1) * options.limit)
            .limit(options.limit);
        const total = await FaucetClaim_1.default.countDocuments(query);
        res.status(200).json({
            success: true,
            faucetClaims,
            pagination: {
                currentPage: options.page,
                totalPages: Math.ceil(total / options.limit),
                totalClaims: total
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve faucet claim history',
            error: error.message
        });
    }
};
exports.getFaucetClaimHistory = getFaucetClaimHistory;
const checkFaucetEligibility = async (req, res) => {
    try {
        const { token, chain } = req.body;
        const isEligible = await FaucetClaim_1.default.isEligibleForClaim(req.user.wallet, token, chain);
        res.status(200).json({
            success: true,
            isEligible,
            token,
            chain
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Eligibility check failed',
            error: error.message
        });
    }
};
exports.checkFaucetEligibility = checkFaucetEligibility;
//# sourceMappingURL=faucetController.js.map