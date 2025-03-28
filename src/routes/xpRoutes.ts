import express from 'express';
import { 
  claimDailyXP,
  logActivity,
  transferXP,
  getXPLeaderboard,
  getUserXPHistory
} from '../controllers/xpController';
import { 
  protect, 
  restrictToAdmin 
} from '../middlewares/auth';
import { 
  validateDailyXPClaim,
  validateActivityLog,
  validateXPTransfer 
} from '../validators/xpValidators';

const router = express.Router();

/**
 * @openapi
 * /api/users/xp/daily-claim:
 *   post:
 *     summary: Claim daily XP reward
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily XP claimed successfully
 *       400:
 *         description: Invalid claim attempt
 */
router.post(
  '/daily-claim', 
  protect,
  validateDailyXPClaim,
  claimDailyXP
);

/**
 * @openapi
 * /api/users/xp/log-activity:
 *   post:
 *     summary: Log user activity for XP
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activityType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Activity logged successfully
 *       400:
 *         description: Invalid activity
 */
router.post(
  '/log-activity', 
  protect,
  validateActivityLog,
  logActivity
);

/**
 * @openapi
 * /api/users/xp/transfer:
 *   post:
 *     summary: Transfer XP between users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipient:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: XP transferred successfully
 *       400:
 *         description: Transfer failed
 */
router.post(
  '/transfer', 
  protect,
  validateXPTransfer,
  transferXP
);

/**
 * @openapi
 * /api/users/xp/leaderboard:
 *   get:
 *     summary: Get XP Leaderboard
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 */
router.get(
  '/leaderboard', 
  getXPLeaderboard
);

/**
 * @openapi
 * /api/users/xp/history:
 *   get:
 *     summary: Get User XP History
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: XP history retrieved successfully
 */
router.get(
  '/history', 
  protect,
  getUserXPHistory
);

/**
 * @openapi
 * /api/users/xp/admin/activities:
 *   get:
 *     summary: Get All XP Activities
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: XP activities retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.get(
  '/admin/activities', 
  protect,
  restrictToAdmin,
  async (req, res) => {
    try {
      // Implement admin XP activity retrieval
      const { 
        page = 1, 
        limit = 50, 
        sortBy = 'timestamp', 
        sortOrder = 'desc' 
      } = req.query;

      // Placeholder for actual implementation
      res.status(200).json({
        success: true,
        message: 'XP Activities retrieved'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve XP activities',
        error: error.message
      });
    }
  }
);

export default router;