import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import FaucetClaim, { FaucetClaimStatus } from '../models/FaucetClaim';
import User from '../models/User';
import XPActivity, { XPActivityType } from '../models/XPActivity';
import { 
  sendTokensFromFaucet,
  calculateFaucetReward 
} from '../services/faucetService';
import config from '../config';

// Request Faucet Tokens
export const requestFaucetTokens = async (req: AuthRequest, res: Response) => {
  try {
    const { token, chain, amount } = req.body;
    const user = req.user;

    // Create faucet claim record
    const faucetClaim = await FaucetClaim.createClaim(
      user!._id,
      user!.wallet,
      amount,
      token,
      chain
    );

    try {
      // Send tokens via blockchain service
      const transactionResult = await sendTokensFromFaucet(
        user!.wallet,
        token,
        chain,
        amount
      );

      // Update faucet claim
      faucetClaim.status = FaucetClaimStatus.COMPLETED;
      faucetClaim.transactionHash = transactionResult.transactionHash;
      await faucetClaim.save();

      // Calculate and award XP
      const xpReward = calculateFaucetReward(amount, token);
      await XPActivity.logActivity(
        user!._id,
        xpReward,
        XPActivityType.FAUCET_CLAIM,
        `Faucet claim: ${amount} ${token}`
      );

      // Update user XP
      user!.xp += xpReward;
      await user!.save();

      res.status(200).json({
        success: true,
        message: 'Faucet tokens claimed successfully',
        faucetClaim,
        xpReward,
        transactionHash: transactionResult.transactionHash
      });
    } catch (sendError) {
      // Handle token sending failure
      faucetClaim.status = FaucetClaimStatus.FAILED;
      faucetClaim.errorMessage = sendError.message;
      await faucetClaim.save();

      res.status(400).json({
        success: false,
        message: 'Failed to send faucet tokens',
        error: sendError.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Faucet token request failed',
      error: error.message
    });
  }
};

// Get Faucet Claim History
export const getFaucetClaimHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      status 
    } = req.query;

    const options = {
      page: Number(page),
      limit: Number(limit)
    };

    const query: { user: any; status?: string } = { 
      user: req.user?._id 
    };

    if (status) {
      query.status = status as string;
    }

    const faucetClaims = await FaucetClaim.find(query)
      .sort({ createdAt: -1 })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);

    const total = await FaucetClaim.countDocuments(query);

    res.status(200).json({
      success: true,
      faucetClaims,
      pagination: {
        currentPage: options.page,
        totalPages: Math.ceil(total / options.limit),
        totalClaims: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve faucet claim history',
      error: error.message
    });
  }
};

// Check Faucet Eligibility
export const checkFaucetEligibility = async (req: AuthRequest, res: Response) => {
  try {
    const { token, chain } = req.body;

    const isEligible = await FaucetClaim.isEligibleForClaim(
      req.user!.wallet,
      token,
      chain
    );

    res.status(200).json({
      success: true,
      isEligible,
      token,
      chain
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Eligibility check failed',
      error: error.message
    });
  }
};