import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth';
import FaucetClaim from '../models/FaucetClaim';
import config from '../config';

// Available Tokens Configuration
const AVAILABLE_TOKENS = [
  { 
    token: 'HLOS', 
    chain: 'helios-testnet',
    maxClaimAmount: 100,
    cooldownHours: 24
  },
  { 
    token: 'ETH', 
    chain: 'goerli',
    maxClaimAmount: 0.1,
    cooldownHours: 24
  }
];

// Faucet Token Request Validator
export const validateFaucetTokenRequest = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  const FaucetTokenRequestSchema = z.object({
    token: z.string().refine(
      (token) => AVAILABLE_TOKENS.some(t => t.token === token),
      { message: "Invalid token" }
    ),
    chain: z.string().refine(
      (chain) => AVAILABLE_TOKENS.some(t => t.chain === chain),
      { message: "Invalid chain" }
    ),
    amount: z.number().positive()
  });

  try {
    const validatedData = FaucetTokenRequestSchema.parse(req.body);
    
    // Find token configuration
    const tokenConfig = AVAILABLE_TOKENS.find(
      t => t.token === validatedData.token && t.chain === validatedData.chain
    );

    // Validate amount
    if (
      validatedData.amount > (tokenConfig?.maxClaimAmount || 0)
    ) {
      return res.status(400).json({
        success: false,
        message: `Claim amount exceeds maximum for ${validatedData.token}`
      });
    }

    // Check previous claims
    const isEligible = await FaucetClaim.isEligibleForClaim(
      req.user!.wallet,
      validatedData.token,
      validatedData.chain
    );

    if (!isEligible) {
      return res.status(400).json({
        success: false,
        message: 'Not eligible for faucet claim. Check cooldown period.'
      });
    }

    // Attach validated data
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid faucet token request',
        errors: error.errors
      });
    }
    next(error);
  }
};

// Faucet Eligibility Check Validator
export const validateFaucetEligibilityCheck = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  const FaucetEligibilitySchema = z.object({
    token: z.string().refine(
      (token) => AVAILABLE_TOKENS.some(t => t.token === token),
      { message: "Invalid token" }
    ),
    chain: z.string().refine(
      (chain) => AVAILABLE_TOKENS.some(t => t.chain === chain),
      { message: "Invalid chain" }
    )
  });

  try {
    const validatedData = FaucetEligibilitySchema.parse(req.body);
    
    // Attach validated data
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid eligibility check request',
        errors: error.errors
      });
    }
    next(error);
  }
};