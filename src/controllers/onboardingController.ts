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
      {
        ...metadata,
        status: OnboardingStepStatus.COMPLETED
      }
    );

    // Award XP based on step
    let xpAwarded = 0;
    switch (stepKey) {
      case 'add_helios_network':
        xpAwarded = 50;
        break;
      case 'claim_from_faucet':
        xpAwarded = 100;
        break;
      case 'mint_early_bird_nft':
        xpAwarded = 200;
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

    // Define the new simplified onboarding steps
    const SIMPLIFIED_ONBOARDING_STEPS = [
      'add_helios_network',
      'claim_from_faucet',
      'mint_early_bird_nft'
    ];

    // Retrieve all steps for the user
    const steps = await OnboardingStep.find({ user: userId });

    // Create a map of completed steps
    const completedSteps = steps
      .filter(step => step.status === OnboardingStepStatus.COMPLETED)
      .map(step => step.stepKey);

    // Calculate progress
    const totalSteps = SIMPLIFIED_ONBOARDING_STEPS.length;
    const completedStepsCount = completedSteps.filter(step => 
      SIMPLIFIED_ONBOARDING_STEPS.includes(step)).length;
    const progressPercentage = (completedStepsCount / totalSteps) * 100;

    // Check if onboarding is complete
    const isOnboardingComplete = completedStepsCount === totalSteps;

    res.status(200).json({
      success: true,
      totalSteps,
      completedSteps,
      completedStepsCount,
      progressPercentage,
      steps,
      isOnboardingComplete
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

    // Check if all required steps are completed
    const requiredSteps = [
      'add_helios_network',
      'claim_from_faucet',
      'mint_early_bird_nft'
    ];
    
    const completedSteps = await OnboardingStep.find({
      user: userId,
      stepKey: { $in: requiredSteps },
      status: OnboardingStepStatus.COMPLETED
    });

    if (completedSteps.length < requiredSteps.length) {
      return res.status(400).json({
        success: false,
        message: 'Not all onboarding steps are completed',
        completedSteps: completedSteps.map(step => step.stepKey)
      });
    }

    // Check if reward already claimed
    const rewardClaimed = await OnboardingStep.findOne({
      user: userId,
      stepKey: 'onboarding_reward_claimed'
    });

    if (rewardClaimed) {
      return res.status(400).json({
        success: false,
        message: 'Onboarding reward already claimed'
      });
    }

    // Award final onboarding reward
    const onboardingRewardXP = config.ONBOARDING_REWARD_XP || 500;

    // Log XP activity for onboarding completion
    await XPActivity.logActivity(
      userId, 
      onboardingRewardXP, 
      XPActivityType.ONBOARDING_REWARD,
      'Onboarding Completion Reward'
    );

    // Update user XP
    user!.xp += onboardingRewardXP;
    
    // Mark onboarding as completed
    user!.onboardingCompleted = true;

    // Mark onboarding reward as claimed
    await OnboardingStep.processStep(
      userId, 
      'onboarding_reward_claimed',
      { status: OnboardingStepStatus.COMPLETED }
    );

    await user!.save();

    res.status(200).json({
      success: true,
      message: 'Onboarding reward claimed',
      xpAwarded: onboardingRewardXP
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to claim onboarding reward',
      error: error.message
    });
  }
};

// Helper API to verify wallet connected the Helios network
export const verifyHeliosNetworkConnection = async (req: AuthRequest, res: Response) => {
  try {
    const { networkId, chainId } = req.body;
    
    // Check if the provided network details match Helios network
    const isHeliosNetwork = chainId === 4242;
    
    if (isHeliosNetwork) {
      res.status(200).json({
        success: true,
        message: 'Helios network verification successful'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Connected network is not Helios',
        expectedChainId: 4242
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify network connection',
      error: error.message
    });
  }
};

// Verify faucet claim transaction
export const verifyFaucetClaim = async (req: AuthRequest, res: Response) => {
  try {
    const { transactionHash } = req.body;
    const userId = req.user?._id;
    
    // Here you would verify the transaction on the blockchain
    // This is a placeholder for the actual verification logic
    const isValidClaim = await verifyTransactionOnBlockchain(transactionHash);
    
    if (isValidClaim) {
      // Mark the faucet claim step as completed
      await OnboardingStep.processStep(
        userId,
        'claim_from_faucet',
        { 
          status: OnboardingStepStatus.COMPLETED,
          transactionHash
        }
      );
      
      res.status(200).json({
        success: true,
        message: 'Faucet claim verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid faucet claim transaction'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify faucet claim',
      error: error.message
    });
  }
};

// Verify NFT mint transaction
export const verifyNFTMint = async (req: AuthRequest, res: Response) => {
  try {
    const { transactionHash, tokenId } = req.body;
    const userId = req.user?._id;
    const user = req.user;
    
    // Here you would verify the NFT mint transaction on the blockchain
    // This is a placeholder for the actual verification logic
    const isValidMint = await verifyNFTMintOnBlockchain(transactionHash, tokenId);
    
    if (isValidMint) {
      // Mark the NFT mint step as completed
      await OnboardingStep.processStep(
        userId,
        'mint_early_bird_nft',
        { 
          status: OnboardingStepStatus.COMPLETED,
          transactionHash,
          tokenId
        }
      );
      
      // Add the NFT to the user's collection
      if (user && tokenId) {
        user.mintedNFTs = user.mintedNFTs || [];
        // user.mintedNFTs.push({
        //   tokenId,
        //   contractAddress: config.EARLY_BIRD_NFT_CONTRACT,
        //   mintedAt: new Date()
        // });
        await user.save();
      }
      
      res.status(200).json({
        success: true,
        message: 'Early Bird NFT mint verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid NFT mint transaction'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify NFT mint',
      error: error.message
    });
  }
};

// Placeholder function - Replace with actual blockchain verification
async function verifyTransactionOnBlockchain(txHash: any) {
  // This would be replaced with actual blockchain API calls
  return true;
}

// Placeholder function - Replace with actual NFT verification
async function verifyNFTMintOnBlockchain(txHash: any, tokenId: any) {
  // This would be replaced with actual blockchain API calls
  return true;
}