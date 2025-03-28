import express from 'express';
import { 
  startOnboardingStep,
  completeOnboardingStep,
  getOnboardingProgress,
  resetOnboardingStep,
  claimOnboardingReward
} from '../controllers/onboardingController';
import { 
  protect 
} from '../middlewares/auth';
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
 *     summary: Start an onboarding step
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stepKey:
 *                 type: string
 *     responses:
 *       200:
 *         description: Onboarding step started
 *       400:
 *         description: Invalid step
 */
router.post(
  '/start', 
  protect,
  validateOnboardingStepStart,
  startOnboardingStep
);

/**
 * @openapi
 * /api/users/onboarding/complete:
 *   post:
 *     summary: Complete an onboarding step
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stepKey:
 *                 type: string
 *     responses:
 *       200:
 *         description: Onboarding step completed
 *       400:
 *         description: Step completion failed
 */
router.post(
  '/complete', 
  protect,
  validateOnboardingStepCompletion,
  completeOnboardingStep
);

/**
 * @openapi
 * /api/users/onboarding/progress:
 *   get:
 *     summary: Get onboarding progress
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding progress retrieved
 */
router.get(
  '/progress', 
  protect,
  getOnboardingProgress
);

/**
 * @openapi
 * /api/users/onboarding/reset:
 *   post:
 *     summary: Reset a specific onboarding step
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stepKey:
 *                 type: string
 *     responses:
 *       200:
 *         description: Onboarding step reset
 *       500:
 *         description: Reset failed
 */
router.post(
  '/reset', 
  protect,
  async (req, res) => {
    try {
      const { stepKey } = req.body;
      const result = await resetOnboardingStep(req.user?._id, stepKey);
      
      res.status(200).json({
        success: true,
        message: 'Onboarding step reset',
        result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to reset onboarding step',
        error: error.message
      });
    }
  }
);

/**
 * @openapi
 * /api/users/onboarding/claim-reward:
 *   post:
 *     summary: Claim onboarding completion reward
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rewardType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reward claimed successfully
 *       400:
 *         description: Reward claim failed
 */
router.post(
  '/claim-reward', 
  protect,
  validateOnboardingRewardClaim,
  claimOnboardingReward
);

export default router;