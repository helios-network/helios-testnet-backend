import { Request, Response, NextFunction } from 'express';
import ContributorApplication, { 
  ContributorApplicationStatus 
} from '../models/ContributorApplication';
import User, { ContributorStatus } from '../models/User';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';

// Apply for Contributorship
export const applyForContributorship = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { 
      fullName, 
      email, 
      githubProfile, 
      linkedinProfile, 
      skills 
    } = req.body;

    // Check if user already has an application
    const existingApplication = await ContributorApplication.findOne({ 
      user: req.user?._id 
    });

    if (existingApplication) {
      return next(new AppError('You have already submitted an application', 400));
    }

    const application = await ContributorApplication.create({
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
  } catch (error) {
    next(new AppError('Failed to submit contributor application', 500));
  }
};

// Get Current User's Application
export const getCurrentContributorApplication = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const application = await ContributorApplication.findOne({ 
      user: req.user?._id 
    });

    if (!application) {
      return next(new AppError('No contributor application found', 404));
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(new AppError('Failed to retrieve application', 500));
  }
};

// Review Contributor Application (Admin)
export const reviewContributorApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    const application = await ContributorApplication.findByIdAndUpdate(
      id, 
      {
        applicationStatus: status,
        reviewedBy: req.user?._id,
        reviewNotes
      },
      { new: true }
    );

    if (!application) {
      return next(new AppError('Application not found', 404));
    }

    // If approved, update user's contributor status
    if (status === ContributorApplicationStatus.APPROVED) {
      await User.findByIdAndUpdate(application.user, {
        contributorStatus: ContributorStatus.APPROVED,
        contributorTag: 'Contributor' // You can customize this
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(new AppError('Failed to review application', 500));
  }
};

// List Contributors
export const listContributors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      skills 
    } = req.query;

    const filter: any = { 
      contributorStatus: ContributorStatus.APPROVED 
    };

    if (skills) {
      filter['contributorDetails.skills'] = { 
        $in: Array.isArray(skills) ? skills : [skills] 
      };
    }

    const contributors = await User.find(filter)
      .select('wallet username contributorTag contributionXP')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

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
  } catch (error) {
    next(new AppError('Failed to retrieve contributors', 500));
  }
};

export const getContributorProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
  
      const contributor = await User.findOne({ 
        _id: id, 
        contributorStatus: ContributorStatus.APPROVED 
      }).select('-password');
  
      if (!contributor) {
        return next(new AppError('Contributor not found', 404));
      }
  
      res.status(200).json({
        success: true,
        data: contributor
      });
    } catch (error) {
      next(new AppError('Failed to retrieve contributor profile', 500));
    }
  };

  // Update Contributor Profile
export const updateContributorProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
  
      // Check if user is a contributor
      const user = await User.findOne({ 
        _id: userId, 
        contributorStatus: ContributorStatus.APPROVED 
      });
  
      if (!user) {
        return next(new AppError('Only approved contributors can update their profile', 403));
      }
  
      // Define the type for updateFields
      const updateFields: {
        username?: string;
        email?: string;
        bio?: string;
        socialLinks?: string[];
        contributorLinks?: string[];
        avatar?: string;
      } = {
        username: req.body.username,
        email: req.body.email,
        bio: req.body.bio,
        socialLinks: req.body.socialLinks,
        contributorLinks: req.body.contributorLinks,
        avatar: req.file ? req.file.path : user.avatar
      };
  
      // Remove undefined fields
      Object.keys(updateFields).forEach(key => 
        updateFields[key as keyof typeof updateFields] === undefined && delete updateFields[key as keyof typeof updateFields]
      );
  
      const updatedUser = await User.findByIdAndUpdate(
        userId, 
        updateFields, 
        { 
          new: true, 
          runValidators: true 
        }
      ).select('-password');
  
      res.status(200).json({
        success: true,
        data: updatedUser
      });
    } catch (error) {
      next(new AppError('Failed to update contributor profile', 500));
    }
  };
  
  // Assign Contributor Role (Admin)
  export const assignContributorRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, role, tags } = req.body;
  
      const user = await User.findById(userId);
  
      if (!user) {
        return next(new AppError('User not found', 404));
      }
  
      // Update contributor status and role
      user.contributorStatus = ContributorStatus.APPROVED;
      user.contributorTag = role;
      
      // Optional: Add specific tags or skills
      if (tags && Array.isArray(tags)) {
        user.contributorLinks = tags;
      }
  
      await user.save();
  
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(new AppError('Failed to assign contributor role', 500));
    }
  };
  
  // Get Contributor Stats
  export const getContributorStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Aggregate contributor statistics
      const stats = await User.aggregate([
        // Match only approved contributors
        { 
          $match: { 
            contributorStatus: ContributorStatus.APPROVED 
          } 
        },
        // Group to get overall stats
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
        // Optionally add top contributors
        {
          $lookup: {
            from: 'users',
            pipeline: [
              { 
                $match: { 
                  contributorStatus: ContributorStatus.APPROVED 
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
  
      // Get contributor application stats
      const applicationStats = await ContributorApplication.aggregate([
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
    } catch (error) {
      next(new AppError('Failed to retrieve contributor stats', 500));
    }
  };
  
  // List Contributor Projects
  export const listContributorProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { 
        page = 1, 
        limit = 10,
        status 
      } = req.query;
  
      // This would typically involve joining with a Projects model
      // For now, we'll use a placeholder implementation
      const projects = [
        // Placeholder project data
        // In a real implementation, this would come from a Projects collection
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
    } catch (error) {
      next(new AppError('Failed to retrieve contributor projects', 500));
    }
  };
  
  // Get Contributor Applications (Admin)
  export const getContributorApplications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        page = 1, 
        limit = 10,
        status 
      } = req.query;
  
      const filter: any = {};
      if (status) {
        filter.applicationStatus = status;
      }
  
      const applications = await ContributorApplication.find(filter)
        .populate('user', 'wallet username email')
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .sort({ createdAt: -1 });
  
      const total = await ContributorApplication.countDocuments(filter);
  
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
    } catch (error) {
      next(new AppError('Failed to retrieve contributor applications', 500));
    }
  };
  