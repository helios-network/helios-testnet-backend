import express from 'express';
import {
  getAllBadges,
  getUserBadges,
  createBadge,
  assignBadgeToUser,
  getBadgeDetails,
  updateBadge,
  deleteBadge
} from '../controllers/badgeController';
import { 
  protect, 
  restrictToAdmin
} from '../middlewares/auth';

const router = express.Router();

/**
 * @openapi
 * /api/users/badges:
 *   get:
 *     summary: Get all available badges
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Badges retrieved successfully
 */
router.get(
  '/', 
  protect,
  getAllBadges
);

/**
 * @openapi
 * /api/users/badges/user:
 *   get:
 *     summary: Get current user's badges
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User badges retrieved successfully
 */
router.get(
  '/user', 
  protect,
  getUserBadges
);

/**
 * @openapi
 * /api/users/badges/{id}:
 *   get:
 *     summary: Get specific badge details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Badge details retrieved successfully
 */
router.get(
  '/:id', 
  protect,
  getBadgeDetails
);

/**
 * @openapi
 * /api/users/badges:
 *   post:
 *     summary: Create a new badge
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Badge created successfully
 *       403:
 *         description: Admin access required
 */
router.post(
  '/', 
  protect, 
  restrictToAdmin,
  createBadge
);

/**
 * @openapi
 * /api/users/badges/assign:
 *   post:
 *     summary: Assign a badge to a user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               badgeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Badge assigned successfully
 *       403:
 *         description: Admin access required
 */
router.post(
  '/assign', 
  protect, 
  restrictToAdmin,
  assignBadgeToUser
);

/**
 * @openapi
 * /api/users/badges/{id}:
 *   patch:
 *     summary: Update a badge
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Badge updated successfully
 *       403:
 *         description: Admin access required
 */
router.patch(
  '/:id', 
  protect, 
  restrictToAdmin,
  updateBadge
);

/**
 * @openapi
 * /api/users/badges/{id}:
 *   delete:
 *     summary: Delete a badge
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Badge deleted successfully
 *       403:
 *         description: Admin access required
 */
router.delete(
  '/:id', 
  protect, 
  restrictToAdmin,
  deleteBadge
);

export default router;