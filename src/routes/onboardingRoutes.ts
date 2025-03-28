import express from 'express';
import { 
  startOnboardingStep,
  completeOnboardingStep,
  getOnboardingProgress,
  resetOnboardingStep,
  claimOnboardingReward
} from '../controllers/onboardingController';
import { protect } from '../middlewares/auth';
import { 
  validateOnboardingStepStart,
  validateOnboardingStepCompletion,
  validateOnboardingRewardClaim
} from '../validators/onboardingValidators';

const router = express.Router();

/**
 * @openapi
 * /api/users/onboarding/start:
 *   post:
 *     tags: [Onboarding]
 *     summary: Start an onboarding step
 *     security: [{bearerAuth: []}]
 *     requestBody:
 *       required: true
 *       content: {application/json: {schema: {type: object, required: [stepKey], properties: {stepKey: {type: string}}}}}
 *     responses: {200: {description: Success}, 400: {description: Error}, 401: {description: Unauthorized}}
 */
router.post('/start', protect, validateOnboardingStepStart, startOnboardingStep);

/**
 * @openapi
 * /api/users/onboarding/complete:
 *   post:
 *     tags: [Onboarding]
 *     summary: Complete an onboarding step
 *     security: [{bearerAuth: []}]
 *     requestBody:
 *       required: true
 *       content: {application/json: {schema: {type: object, required: [stepKey], properties: {stepKey: {type: string}, evidence: {type: string}}}}}
 *     responses: {200: {description: Success}, 400: {description: Error}, 401: {description: Unauthorized}}
 */
router.post('/complete', protect, validateOnboardingStepCompletion, completeOnboardingStep);

/**
 * @openapi
 * /api/users/onboarding/progress:
 *   get:
 *     tags: [Onboarding]
 *     summary: Get onboarding progress
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Success}, 401: {description: Unauthorized}}
 */
router.get('/progress', protect, getOnboardingProgress);

/**
 * @openapi
 * /api/users/onboarding/reset:
 *   post:
 *     tags: [Onboarding]
 *     summary: Reset a specific onboarding step
 *     security: [{bearerAuth: []}]
 *     requestBody:
 *       required: true
 *       content: {application/json: {schema: {type: object, required: [stepKey], properties: {stepKey: {type: string}}}}}
 *     responses: {200: {description: Success}, 401: {description: Unauthorized}, 500: {description: Error}}
 */
router.post('/reset', protect, async (req, res) => {
  try {
    const { stepKey } = req.body;
    const result = await resetOnboardingStep(req.user?._id, stepKey);
    res.status(200).json({ success: true, message: 'Onboarding step reset', result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reset onboarding step', error: error.message });
  }
});

/**
 * @openapi
 * /api/users/onboarding/claim-reward:
 *   post:
 *     tags: [Onboarding]
 *     summary: Claim onboarding completion reward
 *     security: [{bearerAuth: []}]
 *     requestBody:
 *       required: true
 *       content: {application/json: {schema: {type: object, required: [rewardType], properties: {rewardType: {type: string, enum: [xp, nft]}}}}}
 *     responses: {200: {description: Success}, 400: {description: Error}, 401: {description: Unauthorized}}
 */
router.post('/claim-reward', protect, validateOnboardingRewardClaim, claimOnboardingReward);

export default router;