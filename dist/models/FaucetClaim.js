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
exports.FaucetClaimStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var FaucetClaimStatus;
(function (FaucetClaimStatus) {
    FaucetClaimStatus["PENDING"] = "pending";
    FaucetClaimStatus["COMPLETED"] = "completed";
    FaucetClaimStatus["FAILED"] = "failed";
})(FaucetClaimStatus || (exports.FaucetClaimStatus = FaucetClaimStatus = {}));
const FaucetClaimSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    wallet: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    token: {
        type: String,
        required: true,
        trim: true
    },
    chain: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: Object.values(FaucetClaimStatus),
        default: FaucetClaimStatus.PENDING
    },
    transactionHash: {
        type: String,
        trim: true
    },
    errorMessage: {
        type: String
    },
    metadata: {
        type: mongoose_1.default.Schema.Types.Mixed
    },
    cooldownUntil: {
        type: Date
    }
}, {
    timestamps: true,
    collection: 'faucet_claims'
});
FaucetClaimSchema.index({ user: 1, status: 1 });
FaucetClaimSchema.index({ wallet: 1, token: 1, chain: 1 });
FaucetClaimSchema.statics.createClaim = async function (userId, wallet, amount, token, chain, metadata) {
    const cooldownUntil = new Date(Date.now() + (24 * 60 * 60 * 1000));
    return this.create({
        user: userId,
        wallet: wallet.toLowerCase(),
        amount,
        token,
        chain,
        status: FaucetClaimStatus.PENDING,
        metadata,
        cooldownUntil
    });
};
FaucetClaimSchema.statics.isEligibleForClaim = async function (wallet, token, chain) {
    const recentClaim = await this.findOne({
        wallet: wallet.toLowerCase(),
        token,
        chain,
        status: FaucetClaimStatus.COMPLETED,
        createdAt: {
            $gte: new Date(Date.now() - (24 * 60 * 60 * 1000))
        }
    });
    return !recentClaim;
};
const FaucetClaim = mongoose_1.default.model('FaucetClaim', FaucetClaimSchema);
exports.default = FaucetClaim;
//# sourceMappingURL=FaucetClaim.js.map