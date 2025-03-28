import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import OnboardingStep, { 
  OnboardingStepStatus,
  PREDEFINED_ONBOARDING_STEPS 
} from '../models/OnboardingStep';
import User from '../models/User';
import XPActivity, { XPActivityType } from '../models/XPActivity';
import config from '../config';

// Start an Onboarding Step
export const startOnboardingStep = async (req: AuthRequest, res: Response) => {
  try {
    const { stepKey, metadata } = req.body;
    const userId = req.user?._id;

    const step = await OnboardingStep.processStep(
      userId, 
      stepKey, 
      {
        ...metadata,
        status: OnboardingStepStatus.IN_PROGRESS
      }
    );

    res.status(200).json({
      success: true,
      message: 'Onboarding step started',
      step
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to start onboarding step',
      error: error.message
    });
  }
};

// Complete an Onboarding Step
export const completeOnboardingStep = async (req: AuthRequest, res: Response) => {
  try {
    const { stepKey, metadata } = req.body;
    const userId = req.user?._id;
    const user = req.user;

    // Process step completion
    const step = await OnboardingStep.processStep(
      userId, 
      stepKey, 
      metadata
    );

    // Award XP based on step
    let xpAwarded = 0;
    switch (stepKey) {
      case 'connect_wallet':
        xpAwarded = 50;
        break;
      case 'complete_profile':
        xpAwarded = 100;
        break;
      case 'verify_email':
        xpAwarded = 75;
        break;
      case 'join_discord':
        xpAwarded = 50;
        break;
      case 'complete_tutorial':
        xpAwarded = 200;
        break;
      case 'first_transaction':
        xpAwarded = 150;
        break;
    }

    // Log XP activity
    await XPActivity.logActivity(
      userId, 
      xpAwarded, 
      XPActivityType.ONBOARDING,
      `XP for completing ${stepKey}`
    );

    // Update user XP
    user!.xp += xpAwarded;
    await user!.save();

    res.status(200).json({
      success: true,
      message: 'Onboarding step completed',
      step,
      xpAwarded
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to complete onboarding step',
      error: error.message
    });
  }
};

// Get Onboarding Progress
export const getOnboardingProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    // Retrieve all steps for the user
    const steps = await OnboardingStep.find({ user: userId });

    // Create a map of completed steps
    const completedSteps = steps
      .filter(step => step.status === OnboardingStepStatus.COMPLETED)
      .map(step => step.stepKey);

    // Calculate progress
    const totalSteps = PREDEFINED_ONBOARDING_STEPS.length;
    const completedStepsCount = completedSteps.length;
    const progressPercentage = (completedStepsCount / totalSteps) * 100;

    res.status(200).json({
      success: true,
      totalSteps,
      completedSteps,
      completedStepsCount,
      progressPercentage,
      steps
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve onboarding progress',
      error: error.message
    });
  }
};

// Reset Onboarding Step
export const resetOnboardingStep = async (
  userId: string, 
  stepKey: string
) => {
  return OnboardingStep.findOneAndDelete({
    user: userId,
    stepKey
  });
};

// Claim Onboarding Reward
export const claimOnboardingReward = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const user = req.user;

    // Award final onboarding reward
    const onboardingRewardXP = config.ONBOARDING_REWARD_XP || 500;
    const nftReward = config.ONBOARDING_REWARD_NFT;

    // Log XP activity for onboarding completion
    await XPActivity.logActivity(
      userId, 
      onboardingRewardXP, 
      XPActivityType.ONBOARDING_REWARD,
      'Onboarding Completion Reward'
    );

    // Update user XP
    user!.xp += onboardingRewardXP;
    
    // Add NFT to user's collection if applicable
    if (nftReward) {
      user!.mintedNFTs.push(nftReward);
    }

    // Mark onboarding reward as claimed
    await OnboardingStep.processStep(
      userId, 
      'onboarding_reward_claimed'
    );

    await user!.save();

    res.status(200).json({
      success: true,
      message: 'Onboarding reward claimed',
      xpAwarded: onboardingRewardXP,
      nftReward
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to claim onboarding reward',
      error: error.message
    });
  }
};