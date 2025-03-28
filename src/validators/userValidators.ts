import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ethers } from 'ethers';
import User from '../models/User';

// Zod Schema for Registration
const RegistrationSchema = z.object({
  wallet: z.string().refine(
    (addr) => ethers.utils.isAddress(addr), 
    { message: "Invalid Ethereum address" }
  ),
  signature: z.string(),
  // Optional referral code or other registration details
  referralCode: z.string().optional()
});

// Zod Schema for User Update
const UpdateProfileSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(30, { message: "Username must be less than 30 characters" })
    .optional(),
  
  email: z.string()
    .email({ message: "Invalid email address" })
    .optional(),
  
  avatar: z.string()
    .url({ message: "Avatar must be a valid URL" })
    .optional(),
  
  bio: z.string()
    .max(500, { message: "Bio must be less than 500 characters" })
    .optional(),
  
  socialLinks: z.array(
    z.object({
      platform: z.string().min(1),
      url: z.string().url()
    })
  ).optional()
});

// Contributor Application Schema
const ContributorApplicationSchema = z.object({
  contributorTag: z.string()
    .min(3, { message: "Contributor tag must be at least 3 characters" })
    .max(50, { message: "Contributor tag must be less than 50 characters" }),
  
  contributorLinks: z.array(
    z.string().url({ message: "Invalid URL in contributor links" })
  ).min(1, { message: "At least one contribution link is required" }),
  
  expertise: z.string()
    .max(200, { message: "Expertise description too long" })
    .optional()
});

// Registration Validation Middleware
export const validateRegistration = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Validate request body
    const validatedData = RegistrationSchema.parse(req.body);
    
    // Additional checks
    const existingUser = await User.findOne({ 
      wallet: validatedData.wallet.toLowerCase() 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Wallet already registered'
      });
    }
    
    // Optional referral code validation
    if (validatedData.referralCode) {
      // Implement referral code validation logic
      const isValidReferral = await validateReferralCode(validatedData.referralCode);
      if (!isValidReferral) {
        return res.status(400).json({
          success: false,
          message: 'Invalid referral code'
        });
      }
    }
    
    // Attach validated data to request for next middleware
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    next(error);
  }
};

// Profile Update Validation Middleware
export const validateProfileUpdate = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Validate request body
    const validatedData = UpdateProfileSchema.parse(req.body);
    
    // Check username uniqueness if provided
    if (validatedData.username) {
      const existingUser = await User.findOne({ 
        username: validatedData.username,
        wallet: { $ne: req.user?.wallet } // Exclude current user
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }
    
    // Attach validated data to request for next middleware
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    next(error);
  }
};

// Contributor Application Validation
export const validateContributorApplication = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Validate request body
    const validatedData = ContributorApplicationSchema.parse(req.body);
    
    // Additional checks can be added here
    
    // Attach validated data to request for next middleware
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Contributor application validation failed',
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    next(error);
  }
};

// Utility function for referral code validation
async function validateReferralCode(code: string): Promise<boolean> {
  // Implement your referral code validation logic
  // This could involve checking against a database of valid codes
  // or verifying with an external service
  return code === 'HELIOS2025'; // Placeholder
}