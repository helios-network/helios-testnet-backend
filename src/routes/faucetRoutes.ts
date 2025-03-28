import express from 'express';
import { 
  requestFaucetTokens,
  getFaucetClaimHistory,
  checkFaucetEligibility
} from '../controllers/faucetController';
import { 
  protect 
} from '../middlewares/auth';
import { 
  validateFaucetTokenRequest,
  validateFaucetEligibilityCheck
} from '../validators/faucetValidators';

const router = express.Router();

/**
 * @openapi
 * /api/faucet/request:
 *   post:
 *     summary: Request tokens from faucet
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Tokens requested successfully
 *       400:
 *         description: Invalid token request
 */
router.post(
  '/request', 
  protect,
  validateFaucetTokenRequest,
  requestFaucetTokens
);

/**
 * @openapi
 * /api/faucet/history:
 *   get:
 *     summary: Get faucet claim history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Claim history retrieved successfully
 */
router.get(
  '/history', 
  protect,
  getFaucetClaimHistory
);

/**
 * @openapi
 * /api/faucet/check-eligibility:
 *   post:
 *     summary: Check faucet claim eligibility
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Eligibility checked successfully
 */
router.post(
  '/check-eligibility', 
  protect,
  validateFaucetEligibilityCheck,
  checkFaucetEligibility
);

/**
 * @openapi
 * /api/faucet/available-tokens:
 *   get:
 *     summary: Get list of available faucet tokens
 *     responses:
 *       200:
 *         description: Available tokens retrieved successfully
 */
router.get(
  '/available-tokens', 
  async (req, res) => {
    try {
      // This would typically come from a configuration or database
      const availableTokens = [
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

      res.status(200).json({
        success: true,
        tokens: availableTokens
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve available tokens',
        error: error.message
      });
    }
  }
);

export default router;