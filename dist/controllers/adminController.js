"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRewardConfigs = exports.updateRewardConfig = exports.createRewardConfig = exports.syncBlockchainData = exports.getBlockchainStats = exports.updateSystemConfig = exports.getSystemConfig = exports.getAuditLogs = exports.listPermissions = exports.deletePermission = exports.updatePermission = exports.createPermission = exports.listRoles = exports.deleteRole = exports.updateRole = exports.createRole = exports.getDashboardMetrics = exports.getSystemStats = exports.deleteUser = exports.updateUserStatus = exports.getUserDetails = exports.getAllUsers = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const errorHandler_1 = require("../middlewares/errorHandler");
const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, role, status } = req.query;
        const filter = {};
        if (role)
            filter.role = role;
        if (status)
            filter.status = status;
        const users = await User_1.default.find(filter)
            .select('-password')
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await User_1.default.countDocuments(filter);
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
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to retrieve users', 500));
    }
};
exports.getAllUsers = getAllUsers;
const getUserDetails = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.params.id)
            .select('-password')
            .populate('roles')
            .populate('permissions');
        if (!user) {
            return next(new errorHandler_1.AppError('User not found', 404));
        }
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to retrieve user details', 500));
    }
};
exports.getUserDetails = getUserDetails;
const updateUserStatus = async (req, res, next) => {
    try {
        const { status, reason } = req.body;
        const user = await User_1.default.findByIdAndUpdate(req.params.id, {
            status,
            statusReason: reason
        }, {
            new: true,
            runValidators: true
        }).select('-password');
        if (!user) {
            return next(new errorHandler_1.AppError('User not found', 404));
        }
        await AuditLog_1.default.create({
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
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to update user status', 500));
    }
};
exports.updateUserStatus = updateUserStatus;
const deleteUser = async (req, res, next) => {
    try {
        const user = await User_1.default.findByIdAndDelete(req.params.id);
        if (!user) {
            return next(new errorHandler_1.AppError('User not found', 404));
        }
        await AuditLog_1.default.create({
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
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to delete user', 500));
    }
};
exports.deleteUser = deleteUser;
const getSystemStats = async (req, res, next) => {
    try {
        const stats = await User_1.default.aggregate([
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
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to retrieve system stats', 500));
    }
};
exports.getSystemStats = getSystemStats;
const getDashboardMetrics = async (req, res, next) => {
    try {
        const [userCount, contributorCount, recentLogs] = await Promise.all([
            User_1.default.countDocuments(),
            User_1.default.countDocuments({ contributorStatus: 'approved' }),
            AuditLog_1.default.find()
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
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to retrieve dashboard metrics', 500));
    }
};
exports.getDashboardMetrics = getDashboardMetrics;
const createRole = async (req, res, next) => {
    try {
        const { name, description, permissions } = req.body;
        const role = await mongoose_1.default.models.Role.create({
            name,
            description,
            permissions
        });
        await AuditLog_1.default.create({
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
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to create role', 500));
    }
};
exports.createRole = createRole;
const updateRole = async (req, res, next) => {
    try {
        const { name, description, permissions } = req.body;
        const role = await mongoose_1.default.models.Role.findByIdAndUpdate(req.params.id, { name, description, permissions }, { new: true, runValidators: true });
        if (!role) {
            return next(new errorHandler_1.AppError('Role not found', 404));
        }
        await AuditLog_1.default.create({
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
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to update role', 500));
    }
};
exports.updateRole = updateRole;
const deleteRole = async (req, res, next) => {
    try {
        const role = await mongoose_1.default.models.Role.findByIdAndDelete(req.params.id);
        if (!role) {
            return next(new errorHandler_1.AppError('Role not found', 404));
        }
        await AuditLog_1.default.create({
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
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to delete role', 500));
    }
};
exports.deleteRole = deleteRole;
const listRoles = async (req, res, next) => {
    try {
        const roles = await mongoose_1.default.models.Role.find();
        res.status(200).json({
            success: true,
            count: roles.length,
            data: roles
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to list roles', 500));
    }
};
exports.listRoles = listRoles;
const createPermission = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const permission = await mongoose_1.default.models.Permission.create({
            name,
            description
        });
        await AuditLog_1.default.create({
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
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to create permission', 500));
    }
};
exports.createPermission = createPermission;
const updatePermission = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const permission = await mongoose_1.default.models.Permission.findByIdAndUpdate(req.params.id, { name, description }, { new: true, runValidators: true });
        if (!permission) {
            return next(new errorHandler_1.AppError('Permission not found', 404));
        }
        await AuditLog_1.default.create({
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
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to update permission', 500));
    }
};
exports.updatePermission = updatePermission;
const deletePermission = async (req, res, next) => {
    try {
        const permission = await mongoose_1.default.models.Permission.findByIdAndDelete(req.params.id);
        if (!permission) {
            return next(new errorHandler_1.AppError('Permission not found', 404));
        }
        await AuditLog_1.default.create({
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
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to delete permission', 500));
    }
};
exports.deletePermission = deletePermission;
const listPermissions = async (req, res, next) => {
    try {
        const permissions = await mongoose_1.default.models.Permission.find();
        res.status(200).json({
            success: true,
            count: permissions.length,
            data: permissions
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to list permissions', 500));
    }
};
exports.listPermissions = listPermissions;
const getAuditLogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, action } = req.query;
        const filter = {};
        if (action)
            filter.action = action;
        const logs = await AuditLog_1.default.find(filter)
            .populate('userId', 'username')
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .sort({ timestamp: -1 });
        const total = await AuditLog_1.default.countDocuments(filter);
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
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to retrieve audit logs', 500));
    }
};
exports.getAuditLogs = getAuditLogs;
const getSystemConfig = async (req, res, next) => {
    try {
        const config = {
            maintenanceMode: false,
            emailNotifications: true,
            maxConcurrentUsers: 1000
        };
        res.status(200).json({
            success: true,
            data: config
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to retrieve system configuration', 500));
    }
};
exports.getSystemConfig = getSystemConfig;
const updateSystemConfig = async (req, res, next) => {
    try {
        const { maintenanceMode, emailNotifications, maxConcurrentUsers } = req.body;
        const updatedConfig = {
            maintenanceMode: maintenanceMode ?? false,
            emailNotifications: emailNotifications ?? true,
            maxConcurrentUsers: maxConcurrentUsers ?? 1000
        };
        await AuditLog_1.default.create({
            userId: req.user?._id,
            action: 'UPDATE_SYSTEM_CONFIG',
            details: updatedConfig
        });
        res.status(200).json({
            success: true,
            data: updatedConfig
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to update system configuration', 500));
    }
};
exports.updateSystemConfig = updateSystemConfig;
const getBlockchainStats = async (req, res, next) => {
    try {
        const stats = {
            totalTransactions: 1000,
            networkHealth: 'stable',
            lastSyncTimestamp: new Date()
        };
        res.status(200).json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to retrieve blockchain stats', 500));
    }
};
exports.getBlockchainStats = getBlockchainStats;
const syncBlockchainData = async (req, res, next) => {
    try {
        await AuditLog_1.default.create({
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
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to sync blockchain data', 500));
    }
};
exports.syncBlockchainData = syncBlockchainData;
const createRewardConfig = async (req, res, next) => {
    try {
        const { type, name, description, value, conditions, active } = req.body;
        const rewardConfig = {
            type,
            name,
            description,
            value,
            conditions,
            active
        };
        await AuditLog_1.default.create({
            userId: req.user?._id,
            action: 'CREATE_REWARD_CONFIG',
            details: rewardConfig
        });
        res.status(201).json({
            success: true,
            data: rewardConfig
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to create reward configuration', 500));
    }
};
exports.createRewardConfig = createRewardConfig;
const updateRewardConfig = async (req, res, next) => {
    try {
        const { type, name, description, value, conditions, active } = req.body;
        const updatedRewardConfig = {
            id: req.params.id,
            type,
            name,
            description,
            value,
            conditions,
            active
        };
        await AuditLog_1.default.create({
            userId: req.user?._id,
            action: 'UPDATE_REWARD_CONFIG',
            details: updatedRewardConfig
        });
        res.status(200).json({
            success: true,
            data: updatedRewardConfig
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to update reward configuration', 500));
    }
};
exports.updateRewardConfig = updateRewardConfig;
const listRewardConfigs = async (req, res, next) => {
    try {
        const rewardConfigs = [
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
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to list reward configurations', 500));
    }
};
exports.listRewardConfigs = listRewardConfigs;
//# sourceMappingURL=adminController.js.map