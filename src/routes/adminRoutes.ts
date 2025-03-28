import express from 'express';
import {
  // User Management
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  deleteUser,
  
  // System Management
  getSystemStats,
  getDashboardMetrics,
  
  // Role Management
  createRole,
  updateRole,
  deleteRole,
  listRoles,
  
  // Permissions Management
  createPermission,
  updatePermission,
  deletePermission,
  listPermissions,
  
  // Audit Logging
  getAuditLogs,
  
  // Config Management
  getSystemConfig,
  updateSystemConfig,
  
  // Blockchain Management
  getBlockchainStats,
  syncBlockchainData,
  
  // Reward & Incentive Management
  createRewardConfig,
  updateRewardConfig,
  listRewardConfigs
} from '../controllers/adminController';

import { 
  protect, 
  restrictToAdmin 
} from '../middlewares/auth';

const router = express.Router();

// User Management Routes
/**
 * @route   GET /admin/users
 * @desc    Get all users with filtering and pagination
 * @access  Admin only
 */
router.get(
  '/users', 
  protect, 
  restrictToAdmin,
  getAllUsers
);

/**
 * @route   GET /admin/users/:id
 * @desc    Get specific user details
 * @access  Admin only
 */
router.get(
  '/users/:id', 
  protect, 
  restrictToAdmin,
  getUserDetails
);

/**
 * @route   PATCH /admin/users/:id/status
 * @desc    Update user status (ban, activate, etc.)
 * @access  Admin only
 */
router.patch(
  '/users/:id/status', 
  protect, 
  restrictToAdmin,
  updateUserStatus
);

/**
 * @route   DELETE /admin/users/:id
 * @desc    Delete a user
 * @access  Superadmin only
 */
router.delete(
  '/users/:id', 
  protect, 
  restrictToAdmin,
  deleteUser
);

// System Management Routes
/**
 * @route   GET /admin/system/stats
 * @desc    Get comprehensive system statistics
 * @access  Admin only
 */
router.get(
  '/system/stats', 
  protect, 
  restrictToAdmin,
  getSystemStats
);

/**
 * @route   GET /admin/dashboard
 * @desc    Get dashboard metrics
 * @access  Admin only
 */
router.get(
  '/dashboard', 
  protect, 
  restrictToAdmin,
  getDashboardMetrics
);

// Role Management Routes
/**
 * @route   POST /admin/roles
 * @desc    Create a new role
 * @access  Superadmin only
 */
router.post(
  '/roles', 
  protect, 
  restrictToAdmin,
  createRole
);

/**
 * @route   PATCH /admin/roles/:id
 * @desc    Update an existing role
 * @access  Superadmin only
 */
router.patch(
  '/roles/:id', 
  protect, 
  restrictToAdmin,
  updateRole
);

/**
 * @route   DELETE /admin/roles/:id
 * @desc    Delete a role
 * @access  Superadmin only
 */
router.delete(
  '/roles/:id', 
  protect, 
  restrictToAdmin,
  deleteRole
);

/**
 * @route   GET /admin/roles
 * @desc    List all roles
 * @access  Admin only
 */
router.get(
  '/roles', 
  protect, 
  restrictToAdmin,
  listRoles
);

// Permissions Management Routes
/**
 * @route   POST /admin/permissions
 * @desc    Create a new permission
 * @access  Superadmin only
 */
router.post(
  '/permissions', 
  protect, 
  restrictToAdmin,
  createPermission
);

/**
 * @route   PATCH /admin/permissions/:id
 * @desc    Update an existing permission
 * @access  Superadmin only
 */
router.patch(
  '/permissions/:id', 
  protect, 
  restrictToAdmin,
  updatePermission
);

/**
 * @route   DELETE /admin/permissions/:id
 * @desc    Delete a permission
 * @access  Superadmin only
 */
router.delete(
  '/permissions/:id', 
  protect, 
  restrictToAdmin,
  deletePermission
);

/**
 * @route   GET /admin/permissions
 * @desc    List all permissions
 * @access  Admin only
 */
router.get(
  '/permissions', 
  protect, 
  restrictToAdmin,
  listPermissions
);

// Audit Logging Routes
/**
 * @route   GET /admin/audit-logs
 * @desc    Retrieve system audit logs
 * @access  Admin only
 */
router.get(
  '/audit-logs', 
  protect, 
  restrictToAdmin,
  getAuditLogs
);

// System Configuration Routes
/**
 * @route   GET /admin/config
 * @desc    Get system configuration
 * @access  Admin only
 */
router.get(
  '/config', 
  protect, 
  restrictToAdmin,
  getSystemConfig
);

/**
 * @route   PATCH /admin/config
 * @desc    Update system configuration
 * @access  Superadmin only
 */
router.patch(
  '/config', 
  protect, 
  restrictToAdmin,
  updateSystemConfig
);

// Blockchain Management Routes
/**
 * @route   GET /admin/blockchain/stats
 * @desc    Get blockchain network statistics
 * @access  Admin only
 */
router.get(
  '/blockchain/stats', 
  protect, 
  restrictToAdmin,
  getBlockchainStats
);

/**
 * @route   POST /admin/blockchain/sync
 * @desc    Manually trigger blockchain data sync
 * @access  Admin only
 */
router.post(
  '/blockchain/sync', 
  protect, 
  restrictToAdmin,
  syncBlockchainData
);

// Reward Configuration Routes
/**
 * @route   POST /admin/rewards
 * @desc    Create a new reward configuration
 * @access  Superadmin only
 */
router.post(
  '/rewards', 
  protect, 
  restrictToAdmin,
  createRewardConfig
);

/**
 * @route   PATCH /admin/rewards/:id
 * @desc    Update an existing reward configuration
 * @access  Superadmin only
 */
router.patch(
  '/rewards/:id', 
  protect, 
  restrictToAdmin,
  updateRewardConfig
);

/**
 * @route   GET /admin/rewards
 * @desc    List reward configurations
 * @access  Admin only
 */
router.get(
  '/rewards', 
  protect, 
  restrictToAdmin,
  listRewardConfigs
);

export default router;