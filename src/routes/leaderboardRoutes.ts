import express from 'express';
import { 
  getGlobalLeaderboard,
  getContributorLeaderboard,
  getUserLeaderboardRank,
  getLeaderboardStats
} from '../controllers/leaderboardController';
import { 
  protect,
} from '../middlewares/auth';

const router = express.Router();

/**
 * @openapi
 * /api/leaderboard/global:
 *   get:
 *     summary: Get global XP leaderboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Global leaderboard retrieved successfully
 *       401:
 *         description: Unauthorized access
 */
router.get(
  '/global', 
  protect,
  getGlobalLeaderboard
);

/**
 * @openapi
 * /api/leaderboard/contributors:
 *   get:
 *     summary: Get contributor leaderboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contributor leaderboard retrieved successfully
 *       401:
 *         description: Unauthorized access
 */
router.get(
  '/contributors', 
  protect,
  getContributorLeaderboard
);

/**
 * @openapi
 * /api/leaderboard/user-rank:
 *   get:
 *     summary: Get current user's leaderboard rank
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User rank retrieved successfully
 *       401:
 *         description: Unauthorized access
 */
router.get(
  '/user-rank', 
  protect,
  getUserLeaderboardRank
);

/**
 * @openapi
 * /api/leaderboard/stats:
 *   get:
 *     summary: Get overall leaderboard statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leaderboard statistics retrieved successfully
 *       401:
 *         description: Unauthorized access
 */
router.get(
  '/stats', 
  protect,
  getLeaderboardStats
);

export default router;