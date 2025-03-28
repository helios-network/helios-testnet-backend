import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import AuditLog from '../models/AuditLog';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';
import { 
  SystemConfig, 
  BlockchainStats, 
  RewardConfig, 
  AuditLog as IAuditLog 
} from '../types/admin';

// User Management Controllers
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      role, 
      status 
    } = req.query;

    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter)
      .select('-password')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalUsers: total
      },
      data: users
    });
  } catch (error) {
    next(new AppError('Failed to retrieve users', 500));
  }
};

export const getUserDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('roles')
      .populate('permissions');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(new AppError('Failed to retrieve user details', 500));
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, reason } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { 
        status, 
        statusReason: reason 
      }, 
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Create audit log
    await AuditLog.create({
      userId: req.user?._id,
      action: 'UPDATE_USER_STATUS',
      details: {
        targetUserId: user._id,
        status,
        reason
      }
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(new AppError('Failed to update user status', 500));
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Create audit log
    await AuditLog.create({
      userId: req.user?._id,
      action: 'DELETE_USER',
      details: {
        deletedUserId: user._id
      }
    });

    res.status(204).json({
      success: true,
      data: null
    });
  } catch (error) {
    next(new AppError('Failed to delete user', 500));
  }
};

// System Management Controllers
export const getSystemStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0] 
            } 
          },
          usersByRole: {
            $push: {
              role: '$role',
              count: 1
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {}
    });
  } catch (error) {
    next(new AppError('Failed to retrieve system stats', 500));
  }
};

export const getDashboardMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      userCount,
      contributorCount,
      recentLogs
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ contributorStatus: 'approved' }),
      AuditLog.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .populate('userId', 'username')
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers: userCount,
        totalContributors: contributorCount,
        recentActivities: recentLogs
      }
    });
  } catch (error) {
    next(new AppError('Failed to retrieve dashboard metrics', 500));
  }
};

// Role Management Controllers
export const createRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, permissions } = req.body;

    const role = await mongoose.models.Role.create({
      name,
      description,
      permissions
    });

    // Create audit log
    await AuditLog.create({
      userId: req.user?._id,
      action: 'CREATE_ROLE',
      details: {
        roleName: name
      }
    });

    res.status(201).json({
      success: true,
      data: role
    });
  } catch (error) {
    next(new AppError('Failed to create role', 500));
  }
};

export const updateRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, permissions } = req.body;

    const role = await mongoose.models.Role.findByIdAndUpdate(
      req.params.id,
      { name, description, permissions },
      { new: true, runValidators: true }
    );

    if (!role) {
      return next(new AppError('Role not found', 404));
    }

    // Create audit log
    await AuditLog.create({
      userId: req.user?._id,
      action: 'UPDATE_ROLE',
      details: {
        roleId: role._id,
        changes: req.body
      }
    });

    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    next(new AppError('Failed to update role', 500));
  }
};

export const deleteRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const role = await mongoose.models.Role.findByIdAndDelete(req.params.id);

    if (!role) {
      return next(new AppError('Role not found', 404));
    }

    // Create audit log
    await AuditLog.create({
      userId: req.user?._id,
      action: 'DELETE_ROLE',
      details: {
        roleId: role._id
      }
    });

    res.status(204).json({
      success: true,
      data: null
    });
  } catch (error) {
    next(new AppError('Failed to delete role', 500));
  }
};

export const listRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await mongoose.models.Role.find();

    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles
    });
  } catch (error) {
    next(new AppError('Failed to list roles', 500));
  }
};

// Permission Management Controllers
export const createPermission = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;

    const permission = await mongoose.models.Permission.create({
      name,
      description
    });

    // Create audit log
    await AuditLog.create({
      userId: req.user?._id,
      action: 'CREATE_PERMISSION',
      details: {
        permissionName: name
      }
    });

    res.status(201).json({
      success: true,
      data: permission
    });
  } catch (error) {
    next(new AppError('Failed to create permission', 500));
  }
};

export const updatePermission = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;

    const permission = await mongoose.models.Permission.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!permission) {
      return next(new AppError('Permission not found', 404));
    }

    // Create audit log
    await AuditLog.create({
      userId: req.user?._id,
      action: 'UPDATE_PERMISSION',
      details: {
        permissionId: permission._id,
        changes: req.body
      }
    });

    res.status(200).json({
      success: true,
      data: permission
    });
  } catch (error) {
    next(new AppError('Failed to update permission', 500));
  }
};

export const deletePermission = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const permission = await mongoose.models.Permission.findByIdAndDelete(req.params.id);

    if (!permission) {
      return next(new AppError('Permission not found', 404));
    }

    // Create audit log
    await AuditLog.create({
      userId: req.user?._id,
      action: 'DELETE_PERMISSION',
      details: {
        permissionId: permission._id
      }
    });

    res.status(204).json({
      success: true,
      data: null
    });
  } catch (error) {
    next(new AppError('Failed to delete permission', 500));
  }
};

export const listPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permissions = await mongoose.models.Permission.find();

    res.status(200).json({
      success: true,
      count: permissions.length,
      data: permissions
    });
  } catch (error) {
    next(new AppError('Failed to list permissions', 500));
  }
};

// Audit Logging Controller
export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      action 
    } = req.query;

    const filter: any = {};
    if (action) filter.action = action;

    const logs = await AuditLog.find(filter)
      .populate('userId', 'username')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ timestamp: -1 });

    const total = await AuditLog.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: logs.length,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalLogs: total
      },
      data: logs
    });
  } catch (error) {
    next(new AppError('Failed to retrieve audit logs', 500));
  }
};

// System Configuration Controllers
export const getSystemConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In a real-world scenario, this might come from a database or config service
    const config: SystemConfig = {
      maintenanceMode: false,
      emailNotifications: true,
      maxConcurrentUsers: 1000
    };

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    next(new AppError('Failed to retrieve system configuration', 500));
  }
};

export const updateSystemConfig = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { 
      maintenanceMode, 
      emailNotifications, 
      maxConcurrentUsers 
    } = req.body;

    // In a real-world scenario, you'd update this in a database or config service
    const updatedConfig: SystemConfig = {
      maintenanceMode: maintenanceMode ?? false,
      emailNotifications: emailNotifications ?? true,
      maxConcurrentUsers: maxConcurrentUsers ?? 1000
    };

    // Create audit log
    await AuditLog.create({
      userId: req.user?._id,
      action: 'UPDATE_SYSTEM_CONFIG',
      details: updatedConfig
    });

    res.status(200).json({
      success: true,
      data: updatedConfig
    });
  } catch (error) {
    next(new AppError('Failed to update system configuration', 500));
  }
};

// Blockchain Management Controllers
export const getBlockchainStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This would typically involve calling a blockchain service or API
    const stats: BlockchainStats = {
      totalTransactions: 1000,
      networkHealth: 'stable',
      lastSyncTimestamp: new Date()
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(new AppError('Failed to retrieve blockchain stats', 500));
  }
};

export const syncBlockchainData = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Implement blockchain data synchronization logic
    // This might involve calling external blockchain APIs, updating local database, etc.

    // Create audit log
    await AuditLog.create({
      userId: req.user?._id,
      action: 'SYNC_BLOCKCHAIN_DATA',
      details: {
        initiatedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Blockchain data sync initiated'
    });
  } catch (error) {
    next(new AppError('Failed to sync blockchain data', 500));
  }
};

// Reward Configuration Controllers
export const createRewardConfig = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, name, description, value, conditions, active } = req.body;

    const rewardConfig: RewardConfig = {
      type,
      name,
      description,
      value,
      conditions,
      active
    };

    // In a real-world scenario, you'd save this to a database
    await AuditLog.create({
      userId: req.user?._id,
      action: 'CREATE_REWARD_CONFIG',
      details: rewardConfig
    });

    res.status(201).json({
      success: true,
      data: rewardConfig
    });
  } catch (error) {
    next(new AppError('Failed to create reward configuration', 500));
  }
};

export const updateRewardConfig = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, name, description, value, conditions, active } = req.body;

    // In a real-world scenario, you'd update this in a database
    const updatedRewardConfig: RewardConfig = {
      id: req.params.id,
      type,
      name,
      description,
      value,
      conditions,
      active
    };

    await AuditLog.create({
      userId: req.user?._id,
      action: 'UPDATE_REWARD_CONFIG',
      details: updatedRewardConfig
    });

    res.status(200).json({
      success: true,
      data: updatedRewardConfig
    });
  } catch (error) {
    next(new AppError('Failed to update reward configuration', 500));
  }
};

export const listRewardConfigs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In a real-world scenario, you'd retrieve these from a database
    const rewardConfigs: RewardConfig[] = [
      {
        id: '1',
        type: 'XP',
        name: 'First Contribution',
        description: 'XP reward for first contribution',
        value: 100,
        active: true
      }
    ];

    res.status(200).json({
      success: true,
      count: rewardConfigs.length,
      data: rewardConfigs
    });
  } catch (error) {
    next(new AppError('Failed to list reward configurations', 500));
  }
};