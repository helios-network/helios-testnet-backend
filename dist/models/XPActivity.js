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
exports.XPActivityType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var XPActivityType;
(function (XPActivityType) {
    XPActivityType["DAILY_CLAIM"] = "daily_claim";
    XPActivityType["TUTORIAL_COMPLETE"] = "tutorial_complete";
    XPActivityType["CONTRIBUTION"] = "contribution";
    XPActivityType["REFERRAL"] = "referral";
    XPActivityType["TRANSFER"] = "transfer";
    XPActivityType["ADMIN_GRANT"] = "admin_grant";
    XPActivityType["FAUCET_CLAIM"] = "faucet_claim";
    XPActivityType["ONBOARDING"] = "onboarding";
    XPActivityType["ONBOARDING_REWARD"] = "onboarding_reward";
})(XPActivityType || (exports.XPActivityType = XPActivityType = {}));
const XPActivitySchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: Object.values(XPActivityType),
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    metadata: {
        type: mongoose_1.default.Schema.Types.Mixed
    },
    relatedUser: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true,
    collection: 'xp_activities'
});
XPActivitySchema.index({ user: 1, timestamp: -1 });
XPActivitySchema.index({ type: 1, timestamp: -1 });
XPActivitySchema.statics.logActivity = async function (userId, amount, type, description, metadata, relatedUser) {
    const activity = new this({
        user: userId,
        amount,
        type,
        description,
        metadata,
        relatedUser
    });
    return activity.save();
};
const XPActivity = mongoose_1.default.model('XPActivity', XPActivitySchema);
exports.default = XPActivity;
//# sourceMappingURL=XPActivity.js.map