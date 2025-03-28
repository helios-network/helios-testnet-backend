"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContributorApplications = exports.listContributorProjects = exports.getContributorStats = exports.assignContributorRole = exports.updateContributorProfile = exports.getContributorProfile = exports.listContributors = exports.reviewContributorApplication = exports.getCurrentContributorApplication = exports.applyForContributorship = void 0;
const ContributorApplication_1 = __importStar(require("../models/ContributorApplication"));
const User_1 = __importStar(require("../models/User"));
const errorHandler_1 = require("../middlewares/errorHandler");
const applyForContributorship = async (req, res, next) => {
    try {
        const { fullName, email, githubProfile, linkedinProfile, skills } = req.body;
        const existingApplication = await ContributorApplication_1.default.findOne({
            user: req.user?._id
        });
        if (existingApplication) {
            return next(new errorHandler_1.AppError('You have already submitted an application', 400));
        }
        const application = await ContributorApplication_1.default.create({
            user: req.user?._id,
            wallet: req.user?.wallet,
            fullName,
            email,
            githubProfile,
            linkedinProfile,
            skills: skills || [],
            resumeUrl: req.file ? req.file.path : undefined
        });
        res.status(201).json({
            success: true,
            data: application
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to submit contributor application', 500));
    }
};
exports.applyForContributorship = applyForContributorship;
const getCurrentContributorApplication = async (req, res, next) => {
    try {
        const application = await ContributorApplication_1.default.findOne({
            user: req.user?._id
        });
        if (!application) {
            return next(new errorHandler_1.AppError('No contributor application found', 404));
        }
        res.status(200).json({
            success: true,
            data: application
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to retrieve application', 500));
    }
};
exports.getCurrentContributorApplication = getCurrentContributorApplication;
const reviewContributorApplication = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, reviewNotes } = req.body;
        const application = await ContributorApplication_1.default.findByIdAndUpdate(id, {
            applicationStatus: status,
            reviewedBy: req.user?._id,
            reviewNotes
        }, { new: true });
        if (!application) {
            return next(new errorHandler_1.AppError('Application not found', 404));
        }
        if (status === ContributorApplication_1.ContributorApplicationStatus.APPROVED) {
            await User_1.default.findByIdAndUpdate(application.user, {
                contributorStatus: User_1.ContributorStatus.APPROVED,
                contributorTag: 'Contributor'
            });
        }
        res.status(200).json({
            success: true,
            data: application
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to review application', 500));
    }
};
exports.reviewContributorApplication = reviewContributorApplication;
const listContributors = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, skills } = req.query;
        const filter = {
            contributorStatus: User_1.ContributorStatus.APPROVED
        };
        if (skills) {
            filter['contributorDetails.skills'] = {
                $in: Array.isArray(skills) ? skills : [skills]
            };
        }
        const contributors = await User_1.default.find(filter)
            .select('wallet username contributorTag contributionXP')
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        const total = await User_1.default.countDocuments(filter);
        res.status(200).json({
            success: true,
            count: contributors.length,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                totalContributors: total
            },
            data: contributors
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to retrieve contributors', 500));
    }
};
exports.listContributors = listContributors;
const getContributorProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const contributor = await User_1.default.findOne({
            _id: id,
            contributorStatus: User_1.ContributorStatus.APPROVED
        }).select('-password');
        if (!contributor) {
            return next(new errorHandler_1.AppError('Contributor not found', 404));
        }
        res.status(200).json({
            success: true,
            data: contributor
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to retrieve contributor profile', 500));
    }
};
exports.getContributorProfile = getContributorProfile;
const updateContributorProfile = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const user = await User_1.default.findOne({
            _id: userId,
            contributorStatus: User_1.ContributorStatus.APPROVED
        });
        if (!user) {
            return next(new errorHandler_1.AppError('Only approved contributors can update their profile', 403));
        }
        const updateFields = {
            username: req.body.username,
            email: req.body.email,
            bio: req.body.bio,
            socialLinks: req.body.socialLinks,
            contributorLinks: req.body.contributorLinks,
            avatar: req.file ? req.file.path : user.avatar
        };
        Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);
        const updatedUser = await User_1.default.findByIdAndUpdate(userId, updateFields, {
            new: true,
            runValidators: true
        }).select('-password');
        res.status(200).json({
            success: true,
            data: updatedUser
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to update contributor profile', 500));
    }
};
exports.updateContributorProfile = updateContributorProfile;
const assignContributorRole = async (req, res, next) => {
    try {
        const { userId, role, tags } = req.body;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return next(new errorHandler_1.AppError('User not found', 404));
        }
        user.contributorStatus = User_1.ContributorStatus.APPROVED;
        user.contributorTag = role;
        if (tags && Array.isArray(tags)) {
            user.contributorLinks = tags;
        }
        await user.save();
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to assign contributor role', 500));
    }
};
exports.assignContributorRole = assignContributorRole;
const getContributorStats = async (req, res, next) => {
    try {
        const stats = await User_1.default.aggregate([
            {
                $match: {
                    contributorStatus: User_1.ContributorStatus.APPROVED
                }
            },
            {
                $group: {
                    _id: null,
                    totalContributors: { $sum: 1 },
                    totalContributionXP: { $sum: '$contributionXP' },
                    averageContributionXP: { $avg: '$contributionXP' },
                    contributorsByTag: {
                        $push: {
                            tag: '$contributorTag',
                            count: 1
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    pipeline: [
                        {
                            $match: {
                                contributorStatus: User_1.ContributorStatus.APPROVED
                            }
                        },
                        { $sort: { contributionXP: -1 } },
                        { $limit: 10 },
                        {
                            $project: {
                                wallet: 1,
                                username: 1,
                                contributionXP: 1
                            }
                        }
                    ],
                    as: 'topContributors'
                }
            }
        ]);
        const applicationStats = await ContributorApplication_1.default.aggregate([
            {
                $group: {
                    _id: '$applicationStatus',
                    count: { $sum: 1 }
                }
            }
        ]);
        res.status(200).json({
            success: true,
            data: {
                contributorStats: stats[0] || {},
                applicationStats: applicationStats
            }
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to retrieve contributor stats', 500));
    }
};
exports.getContributorStats = getContributorStats;
const listContributorProjects = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const projects = [
            {
                name: 'Sample Project',
                description: 'A sample contributor project',
                status: status || 'active',
                contributors: [req.user?._id]
            }
        ];
        res.status(200).json({
            success: true,
            count: projects.length,
            pagination: {
                currentPage: Number(page),
                totalPages: 1,
                totalProjects: projects.length
            },
            data: projects
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to retrieve contributor projects', 500));
    }
};
exports.listContributorProjects = listContributorProjects;
const getContributorApplications = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const filter = {};
        if (status) {
            filter.applicationStatus = status;
        }
        const applications = await ContributorApplication_1.default.find(filter)
            .populate('user', 'wallet username email')
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await ContributorApplication_1.default.countDocuments(filter);
        res.status(200).json({
            success: true,
            count: applications.length,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                totalApplications: total
            },
            data: applications
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to retrieve contributor applications', 500));
    }
};
exports.getContributorApplications = getContributorApplications;
//# sourceMappingURL=contributorController.js.map