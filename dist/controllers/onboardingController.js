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
exports.claimOnboardingReward = exports.resetOnboardingStep = exports.getOnboardingProgress = exports.completeOnboardingStep = exports.startOnboardingStep = void 0;
const OnboardingStep_1 = __importStar(require("../models/OnboardingStep"));
const XPActivity_1 = __importStar(require("../models/XPActivity"));
const config_1 = __importDefault(require("../config"));
const startOnboardingStep = async (req, res) => {
    try {
        const { stepKey, metadata } = req.body;
        const userId = req.user?._id;
        const step = await OnboardingStep_1.default.processStep(userId, stepKey, {
            ...metadata,
            status: OnboardingStep_1.OnboardingStepStatus.IN_PROGRESS
        });
        res.status(200).json({
            success: true,
            message: 'Onboarding step started',
            step
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to start onboarding step',
            error: error.message
        });
    }
};
exports.startOnboardingStep = startOnboardingStep;
const completeOnboardingStep = async (req, res) => {
    try {
        const { stepKey, metadata } = req.body;
        const userId = req.user?._id;
        const user = req.user;
        const step = await OnboardingStep_1.default.processStep(userId, stepKey, metadata);
        let xpAwarded = 0;
        switch (stepKey) {
            case 'connect_wallet':
                xpAwarded = 50;
                break;
            case 'complete_profile':
                xpAwarded = 100;
                break;
            case 'verify_email':
                xpAwarded = 75;
                break;
            case 'join_discord':
                xpAwarded = 50;
                break;
            case 'complete_tutorial':
                xpAwarded = 200;
                break;
            case 'first_transaction':
                xpAwarded = 150;
                break;
        }
        await XPActivity_1.default.logActivity(userId, xpAwarded, XPActivity_1.XPActivityType.ONBOARDING, `XP for completing ${stepKey}`);
        user.xp += xpAwarded;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Onboarding step completed',
            step,
            xpAwarded
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to complete onboarding step',
            error: error.message
        });
    }
};
exports.completeOnboardingStep = completeOnboardingStep;
const getOnboardingProgress = async (req, res) => {
    try {
        const userId = req.user?._id;
        const steps = await OnboardingStep_1.default.find({ user: userId });
        const completedSteps = steps
            .filter(step => step.status === OnboardingStep_1.OnboardingStepStatus.COMPLETED)
            .map(step => step.stepKey);
        const totalSteps = OnboardingStep_1.PREDEFINED_ONBOARDING_STEPS.length;
        const completedStepsCount = completedSteps.length;
        const progressPercentage = (completedStepsCount / totalSteps) * 100;
        res.status(200).json({
            success: true,
            totalSteps,
            completedSteps,
            completedStepsCount,
            progressPercentage,
            steps
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve onboarding progress',
            error: error.message
        });
    }
};
exports.getOnboardingProgress = getOnboardingProgress;
const resetOnboardingStep = async (userId, stepKey) => {
    return OnboardingStep_1.default.findOneAndDelete({
        user: userId,
        stepKey
    });
};
exports.resetOnboardingStep = resetOnboardingStep;
const claimOnboardingReward = async (req, res) => {
    try {
        const userId = req.user?._id;
        const user = req.user;
        const onboardingRewardXP = config_1.default.ONBOARDING_REWARD_XP || 500;
        const nftReward = config_1.default.ONBOARDING_REWARD_NFT;
        await XPActivity_1.default.logActivity(userId, onboardingRewardXP, XPActivity_1.XPActivityType.ONBOARDING_REWARD, 'Onboarding Completion Reward');
        user.xp += onboardingRewardXP;
        if (nftReward) {
            user.mintedNFTs.push(nftReward);
        }
        await OnboardingStep_1.default.processStep(userId, 'onboarding_reward_claimed');
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Onboarding reward claimed',
            xpAwarded: onboardingRewardXP,
            nftReward
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to claim onboarding reward',
            error: error.message
        });
    }
};
exports.claimOnboardingReward = claimOnboardingReward;
//# sourceMappingURL=onboardingController.js.map