import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth';
import OnboardingStep, { 
  PREDEFINED_ONBOARDING_STEPS,
  OnboardingStepStatus 
} from '../models/OnboardingStep';

// Validate Onboarding Step Start
export const validateOnboardingStepStart = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  const OnboardingStepStartSchema = z.object({
    stepKey: z.enum(PREDEFINED_ONBOARDING_STEPS as [string, ...string[]]),
    metadata: z.record(z.string(), z.any()).optional()
  });

  try {
    const validatedData = OnboardingStepStartSchema.parse(req.body);
    
    // Check if step is already in progress or completed
    const existingStep = await OnboardingStep.findOne({
      user: req.user?._id,
      stepKey: validatedData.stepKey,
      status: { $in: [
        OnboardingStepStatus.IN_PROGRESS, 
        OnboardingStepStatus.COMPLETED
      ]}
    });

    if (existingStep) {
      return res.status(400).json({
        success: false,
        message: 'Onboarding step already started or completed',
        currentStatus: existingStep.status
      });
    }

    // Attach validated data
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid onboarding step start',
        errors: error.errors
      });
    }
    next(error);
  }
};

// Validate Onboarding Step Completion
export const validateOnboardingStepCompletion = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  const OnboardingStepCompletionSchema = z.object({
    stepKey: z.enum(PREDEFINED_ONBOARDING_STEPS as [string, ...string[]]),
    metadata: z.record(z.string(), z.any()).optional()
  });

  try {
    const validatedData = OnboardingStepCompletionSchema.parse(req.body);
    
    // Check if step exists and is not already completed
    const existingStep = await OnboardingStep.findOne({
      user: req.user?._id,
      stepKey: validatedData.stepKey
    });

    if (!existingStep) {
      return res.status(400).json({
        success: false,
        message: 'Onboarding step not started'
      });
    }

    if (existingStep.status === OnboardingStepStatus.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: 'Onboarding step already completed'
      });
    }

    // Attach validated data
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid onboarding step completion',
        errors: error.errors
      });
    }
    next(error);
  }
};

// Validate Onboarding Reward Claim
export const validateOnboardingRewardClaim = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Check if all required onboarding steps are completed
    const incompleteSteps = await OnboardingStep.find({
      user: req.user?._id,
      status: { $ne: OnboardingStepStatus.COMPLETED }
    });

    if (incompleteSteps.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Not all onboarding steps are completed',
        incompleteSteps: incompleteSteps.map(step => step.stepKey)
      });
    }

    // Check if reward has already been claimed
    const rewardClaimedStep = await OnboardingStep.findOne({
      user: req.user?._id,
      stepKey: 'onboarding_reward_claimed'
    });

    if (rewardClaimedStep) {
      return res.status(400).json({
        success: false,
        message: 'Onboarding reward already claimed'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Onboarding reward validation failed',
      error: error.message
    });
  }
};