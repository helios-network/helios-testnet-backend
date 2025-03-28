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
exports.ContributorStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ethers_1 = require("ethers");
const config_1 = __importDefault(require("../config"));
var ContributorStatus;
(function (ContributorStatus) {
    ContributorStatus["NONE"] = "none";
    ContributorStatus["PENDING"] = "pending";
    ContributorStatus["APPROVED"] = "approved";
    ContributorStatus["REJECTED"] = "rejected";
})(ContributorStatus || (exports.ContributorStatus = ContributorStatus = {}));
const UserSchema = new mongoose_1.Schema({
    wallet: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return ethers_1.ethers.utils.isAddress(v);
            },
            message: props => `${props.value} is not a valid Ethereum address!`
        }
    },
    username: {
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 30,
        unique: true,
        sparse: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        sparse: true,
        validate: {
            validator: function (v) {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    avatar: {
        type: String,
        default: null
    },
    xp: {
        type: Number,
        default: 0,
        min: 0,
        max: 1000000
    },
    level: {
        type: Number,
        default: 1,
        min: 1,
        max: 100
    },
    onboardingSteps: {
        type: [String],
        default: []
    },
    contributorStatus: {
        type: String,
        enum: Object.values(ContributorStatus),
        default: ContributorStatus.NONE
    },
    contributorTag: {
        type: String,
        trim: true
    },
    contributorLinks: {
        type: [String],
        default: []
    },
    contributionXP: {
        type: Number,
        default: 0,
        min: 0,
        max: 1000000
    },
    bio: {
        type: String,
        maxlength: 500
    },
    socialLinks: [{
            platform: {
                type: String,
                trim: true
            },
            url: {
                type: String,
                validate: {
                    validator: function (v) {
                        try {
                            new URL(v);
                            return true;
                        }
                        catch {
                            return false;
                        }
                    },
                    message: props => `${props.value} is not a valid URL!`
                }
            }
        }],
    mintedNFTs: {
        type: [String],
        default: []
    },
    badges: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Badge',
            default: []
        }],
}, {
    timestamps: true,
    collection: 'users',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
UserSchema.virtual('rank').get(function () {
    return this.xp;
});
UserSchema.virtual('contributionLevel').get(function () {
    const contributionLevels = {
        1: 0,
        2: 100,
        3: 250,
        4: 500,
        5: 1000
    };
    for (let level = Object.keys(contributionLevels).length; level > 0; level--) {
        if (this.contributionXP >= contributionLevels[level]) {
            return level;
        }
    }
    return 1;
});
UserSchema.methods.calculateLevel = function () {
    const levels = config_1.default.XP_LEVELS || {
        1: 0,
        2: 100,
        3: 250,
        4: 500,
        5: 1000
    };
    for (let level = Object.keys(levels).length; level > 0; level--) {
        if (this.xp >= levels[level]) {
            return level;
        }
    }
    return 1;
};
UserSchema.methods.hasCompletedOnboarding = function () {
    const requiredSteps = [
        'connect-wallet',
        'claim-faucet',
        'complete-tutorial'
    ];
    return requiredSteps.every(step => this.onboardingSteps.includes(step));
};
UserSchema.methods.updateContributionXP = function (amount) {
    this.contributionXP = (this.contributionXP || 0) + amount;
    return this.save();
};
UserSchema.statics.findByWallet = async function (wallet) {
    return this.findOne({ wallet: wallet.toLowerCase() });
};
UserSchema.statics.createWithWallet = async function (wallet) {
    const user = new this({
        wallet: wallet.toLowerCase(),
        xp: 0,
        level: 1,
        onboardingSteps: [],
        contributorStatus: ContributorStatus.NONE,
        contributionXP: 0
    });
    return user.save();
};
UserSchema.statics.findTopContributors = async function (limit = 10) {
    return this.find({ contributorStatus: ContributorStatus.APPROVED })
        .sort({ contributionXP: -1 })
        .limit(limit);
};
UserSchema.pre('save', function (next) {
    if (this.isModified('xp')) {
        this.level = this.calculateLevel();
    }
    next();
});
UserSchema.index({ wallet: 1 }, { unique: true });
UserSchema.index({ xp: -1 });
UserSchema.index({ contributorStatus: 1 });
UserSchema.index({ contributionXP: -1 });
const User = mongoose_1.default.model('User', UserSchema);
exports.default = User;
//# sourceMappingURL=User.js.map