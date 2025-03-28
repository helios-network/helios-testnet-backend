import express from 'express';
import {
  applyForContributorship,
  getContributorApplications,
  reviewContributorApplication,
  getCurrentContributorApplication,
  listContributors,
  getContributorProfile,
  updateContributorProfile,
  assignContributorRole,
  getContributorStats,
  listContributorProjects
} from '../controllers/contributorController';
import { 
  protect, 
  restrictToAdmin 
} from '../middlewares/auth';
import { uploadMiddleware } from '../middlewares/upload';

const router = express.Router();

/**
 * @openapi
 * /api/users/contributors/apply:
 *   post:
 *     summary: Submit contributor application
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resumeFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Application submitted successfully
 *       400:
 *         description: Invalid application
 */
router.post(
  '/apply', 
  protect,
  uploadMiddleware.single('resumeFile'),
  applyForContributorship
);

/**
 * @openapi
 * /api/users/contributors/my-application:
 *   get:
 *     summary: Get current user's contributor application
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Application retrieved successfully
 */
router.get(
  '/my-application', 
  protect,
  getCurrentContributorApplication
);

/**
 * @openapi
 * /api/users/contributors/applications:
 *   get:
 *     summary: Get all contributor applications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.get(
  '/applications', 
  protect,
  restrictToAdmin,
  getContributorApplications
);

/**
 * @openapi
 * /api/users/contributors/applications/{id}:
 *   patch:
 *     summary: Review and update contributor application status
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
 *         description: Application reviewed successfully
 *       403:
 *         description: Admin access required
 */
router.patch(
  '/applications/:id', 
  protect,
  restrictToAdmin,
  reviewContributorApplication
);

/**
 * @openapi
 * /api/users/contributors:
 *   get:
 *     summary: List all approved contributors
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contributors retrieved successfully
 */
router.get(
  '/', 
  protect,
  listContributors
);

/**
 * @openapi
 * /api/users/contributors/stats:
 *   get:
 *     summary: Get contributor ecosystem statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contributor stats retrieved successfully
 */
router.get(
  '/stats', 
  protect,
  getContributorStats
);

/**
 * @openapi
 * /api/users/contributors/projects:
 *   get:
 *     summary: List contributor projects
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contributor projects retrieved successfully
 */
router.get(
  '/projects', 
  protect,
  listContributorProjects
);

/**
 * @openapi
 * /api/users/contributors/{id}:
 *   get:
 *     summary: Get specific contributor profile
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
 *         description: Contributor profile retrieved successfully
 */
router.get(
  '/:id', 
  protect,
  getContributorProfile
);

/**
 * @openapi
 * /api/users/contributors/profile:
 *   patch:
 *     summary: Update contributor profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.patch(
  '/profile', 
  protect,
  uploadMiddleware.single('profileImage'),
  updateContributorProfile
);

/**
 * @openapi
 * /api/users/contributors/assign-role:
 *   post:
 *     summary: Assign contributor role
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Role assigned successfully
 *       403:
 *         description: Admin access required
 */
router.post(
  '/assign-role', 
  protect,
  restrictToAdmin,
  assignContributorRole
);

export default router;