"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const onboardingController_1 = require("../controllers/onboardingController");
const auth_1 = require("../middlewares/auth");
const onboardingValidators_1 = require("../validators/onboardingValidators");
const router = express_1.default.Router();
router.post('/start', auth_1.protect, onboardingValidators_1.validateOnboardingStepStart, onboardingController_1.startOnboardingStep);
router.post('/complete', auth_1.protect, onboardingValidators_1.validateOnboardingStepCompletion, onboardingController_1.completeOnboardingStep);
router.get('/progress', auth_1.protect, onboardingController_1.getOnboardingProgress);
router.post('/reset', auth_1.protect, async (req, res) => {
    try {
        const { stepKey } = req.body;
        const result = await (0, onboardingController_1.resetOnboardingStep)(req.user?._id, stepKey);
        res.status(200).json({
            success: true,
            message: 'Onboarding step reset',
            result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to reset onboarding step',
            error: error.message
        });
    }
});
router.post('/claim-reward', auth_1.protect, onboardingValidators_1.validateOnboardingRewardClaim, onboardingController_1.claimOnboardingReward);
exports.default = router;
//# sourceMappingURL=onboardingRoutes.js.map