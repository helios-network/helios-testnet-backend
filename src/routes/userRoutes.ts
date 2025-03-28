import express from 'express';
import { 
  registerUser, 
  getUserProfile, 
  updateUserProfile, 
  getUserStats,
  searchUsers,
  getUserNFTs,
  getUserLevelInfo,
} from '../controllers/userController';
import { 
  verifyWalletSignature, 
  protect, 
  restrictToAdmin 
} from '../middlewares/auth';
import { 
    validateRegistration,
    validateProfileUpdate 
} from '../validators/userValidators';
import User from '../models/User';
import { generateToken } from "../middlewares/auth"

const router = express.Router();

/**
 * @openapi
 * /api/users/register:
 *   post:
 *     summary: Register a new user with wallet
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wallet
 *               - signature
 *             properties:
 *               wallet:
 *                 type: string
 *               signature:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Registration failed
 */
router.post(
  '/register', (req, res, next) => {
    next();
  },
  validateRegistration,
  verifyWalletSignature,
  registerUser
);

/**
 * @openapi
 * /api/users/login:
 *   post:
 *     summary: Login with wallet signature
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wallet
 *               - signature
 *             properties:
 *               wallet:
 *                 type: string
 *               signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Authentication failed
 */
router.post(
    '/login',
    verifyWalletSignature,
    async (req, res) => {
      try {
        // The wallet is already verified by middleware
        const { wallet } = req.body;
        
        // Find the existing user
        const user = await User.findOne({ wallet: wallet.toLowerCase() });
        
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User not found. Please register first.'
          });
        }
        
        // Generate JWT token
        const token = generateToken(user.wallet);
        
        // Return user data and token
        res.status(200).json({
          success: true,
          token,
          user: {
            _id: user._id,
            wallet: user.wallet,
            username: user.username,
            createdAt: user.createdAt
          }
        });
      } catch (error) {
        console.log(error)
        res.status(500).json({
          success: false,
          message: 'Login failed',
          error: error.message
        });
      }
    }
  );


/**
 * @openapi
 * /api/users/xp/level:
 *   get:
 *     summary: Get user's current level and XP progress
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Level info retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/xp/level', protect, getUserLevelInfo);

  
/**
 * @openapi
 * /api/users/profile/{wallet}:
 *   get:
 *     summary: Get user public profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: wallet
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       404:
 *         description: Profile not found
 */
router.get(
  '/profile/:wallet', 
  getUserProfile
);

/**
 * @openapi
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/profile', 
  protect,
  validateProfileUpdate,
  updateUserProfile
);

/**
 * @openapi
 * /api/users/stats/{wallet}:
 *   get:
 *     summary: Get comprehensive user stats
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: wallet
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User stats retrieved successfully
 *       404:
 *         description: User not found
 */
router.get(
  '/stats/:wallet', 
  getUserStats
);

/**
 * @openapi
 * /api/users/nfts/{wallet}:
 *   get:
 *     summary: Get user's NFT collection
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: wallet
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: NFT collection retrieved successfully
 *       404:
 *         description: No NFTs found
 */
router.get(
  '/nfts/:wallet',
  getUserNFTs
);

/**
 * @openapi
 * /api/users/search:
 *   get:
 *     summary: Search and filter users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.get(
  '/search', 
  protect,
  restrictToAdmin,
  searchUsers
);

/**
 * @openapi
 * /api/users/{wallet}:
 *   delete:
 *     summary: Delete user account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wallet
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User account deleted successfully
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
router.delete(
  '/:wallet', 
  protect,
  restrictToAdmin,
  async (req, res) => {
    try {
      const { wallet } = req.params;
      
      // Delete user logic here
      // This should remove user from database, 
      // potentially archive their data
      
      res.status(200).json({
        success: true,
        message: 'User account deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete user account',
        error: error.message
      });
    }
  }
);

export default router;