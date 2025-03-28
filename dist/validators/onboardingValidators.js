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
exports.validateOnboardingRewardClaim = exports.validateOnboardingStepCompletion = exports.validateOnboardingStepStart = void 0;
const zod_1 = require("zod");
const OnboardingStep_1 = __importStar(require("../models/OnboardingStep"));
const validateOnboardingStepStart = async (req, res, next) => {
    const OnboardingStepStartSchema = zod_1.z.object({
        stepKey: zod_1.z.enum(OnboardingStep_1.PREDEFINED_ONBOARDING_STEPS),
        metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional()
    });
    try {
        const validatedData = OnboardingStepStartSchema.parse(req.body);
        const existingStep = await OnboardingStep_1.default.findOne({
            user: req.user?._id,
            stepKey: validatedData.stepKey,
            status: { $in: [
                    OnboardingStep_1.OnboardingStepStatus.IN_PROGRESS,
                    OnboardingStep_1.OnboardingStepStatus.COMPLETED
                ] }
        });
        if (existingStep) {
            return res.status(400).json({
                success: false,
                message: 'Onboarding step already started or completed',
                currentStatus: existingStep.status
            });
        }
        req.body = validatedData;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid onboarding step start',
                errors: error.errors
            });
        }
        next(error);
    }
};
exports.validateOnboardingStepStart = validateOnboardingStepStart;
const validateOnboardingStepCompletion = async (req, res, next) => {
    const OnboardingStepCompletionSchema = zod_1.z.object({
        stepKey: zod_1.z.enum(OnboardingStep_1.PREDEFINED_ONBOARDING_STEPS),
        metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional()
    });
    try {
        const validatedData = OnboardingStepCompletionSchema.parse(req.body);
        const existingStep = await OnboardingStep_1.default.findOne({
            user: req.user?._id,
            stepKey: validatedData.stepKey
        });
        if (!existingStep) {
            return res.status(400).json({
                success: false,
                message: 'Onboarding step not started'
            });
        }
        if (existingStep.status === OnboardingStep_1.OnboardingStepStatus.COMPLETED) {
            return res.status(400).json({
                success: false,
                message: 'Onboarding step already completed'
            });
        }
        req.body = validatedData;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid onboarding step completion',
                errors: error.errors
            });
        }
        next(error);
    }
};
exports.validateOnboardingStepCompletion = validateOnboardingStepCompletion;
const validateOnboardingRewardClaim = async (req, res, next) => {
    try {
        const incompleteSteps = await OnboardingStep_1.default.find({
            user: req.user?._id,
            status: { $ne: OnboardingStep_1.OnboardingStepStatus.COMPLETED }
        });
        if (incompleteSteps.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Not all onboarding steps are completed',
                incompleteSteps: incompleteSteps.map(step => step.stepKey)
            });
        }
        const rewardClaimedStep = await OnboardingStep_1.default.findOne({
            user: req.user?._id,
            stepKey: 'onboarding_reward_claimed'
        });
        if (rewardClaimedStep) {
            return res.status(400).json({
                success: false,
                message: 'Onboarding reward already claimed'
            });
        }
        next();
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Onboarding reward validation failed',
            error: error.message
        });
    }
};
exports.validateOnboardingRewardClaim = validateOnboardingRewardClaim;
//# sourceMappingURL=onboardingValidators.js.map