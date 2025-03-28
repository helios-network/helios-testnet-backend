import mongoose, { Document, Schema, Model } from 'mongoose';
import { ethers } from 'ethers';
import config from '../config';
import Badge from './Badge'; // Import Badge model

// Enum for Contributor Status
export enum ContributorStatus {
  NONE = 'none',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Social Links Interface
interface SocialLinks {
  platform: string;
  url: string;
}

// User Interface
export interface IUser extends Document {
  // Wallet Information
  wallet: string;
  username?: string;
  email?: string;
  avatar?: string;
  
  // Progression System
  xp: number;
  level: number;
  onboardingCompleted: boolean;
  
  // Onboarding & Contributor System
  onboardingSteps: string[];
  contributorStatus: ContributorStatus;
  contributorTag?: string;
  contributorLinks?: string[];
  contributionXP: number; // Added contributionXP
  
  // Profile Information
  bio?: string;
  socialLinks?: SocialLinks[];
  
  // Blockchain & Rewards
  mintedNFTs: string[];
  badges: (string | typeof Badge)[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  calculateLevel(): number;
  hasCompletedOnboarding(): boolean;
  updateContributionXP(amount: number): Promise<IUser>; // Added method
}

// User Schema
const UserSchema: Schema<IUser> = new Schema({
  // Wallet Address
  wallet: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return ethers.utils.isAddress(v);
      },
      message: props => `${props.value} is not a valid Ethereum address!`
    }
  },
  
  // Optional Username
  username: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 30,
    unique: true,
    sparse: true
  },

  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  
  // Optional Email
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true,
    validate: {
      validator: function(v: string) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  
  // Avatar URL
  avatar: {
    type: String,
    default: null
  },
  
  // XP & Level System
  xp: {
    type: Number,
    default: 0,
    min: 0,
    max: 1000000 // Prevents potential exploit
  },
  
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 100
  },
  
  // Onboarding Steps
  onboardingSteps: {
    type: [String],
    default: []
  },
  
  // Contributor System
  contributorStatus: {
    type: String,
    enum: Object.values(ContributorStatus),
    default: ContributorStatus.NONE
  },
  
  contributorTag: {
    type: String,
    trim: true
  },
  
  contributorLinks: {
    type: [String],
    default: []
  },
  
  // Add Contribution XP
  contributionXP: {
    type: Number,
    default: 0,
    min: 0,
    max: 1000000 // Prevent potential exploits
  },
  
  // Profile Information
  bio: {
    type: String,
    maxlength: 500
  },
  
  socialLinks: [{
    platform: {
      type: String,
      trim: true
    },
    url: {
      type: String,
      validate: {
        validator: function(v: string) {
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        },
        message: props => `${props.value} is not a valid URL!`
      }
    }
  }],
  
  // Blockchain Rewards
  mintedNFTs: {
    type: [String],
    default: []
  },
  
  badges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    default: []
  }],
}, {
  timestamps: true,
  collection: 'users',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual Properties
UserSchema.virtual('rank').get(function(this: IUser) {
  // Placeholder for calculating user rank
  return this.xp; // Simple implementation
});

// Virtual for Contribution Level
UserSchema.virtual('contributionLevel').get(function(this: IUser) {
  const contributionLevels: { [key: number]: number } = {
    1: 0,
    2: 100,
    3: 250,
    4: 500,
    5: 1000
  };
  
  for (let level = Object.keys(contributionLevels).length; level > 0; level--) {
    if (this.contributionXP >= contributionLevels[level]) {
      return level;
    }
  }
  
  return 1;
});

// Methods
UserSchema.methods.calculateLevel = function(this: IUser): number {
  // Dynamic level calculation based on XP
  const levels: { [key: number]: number } = config.XP_LEVELS || {
    1: 0,
    2: 100,
    3: 250,
    4: 500,
    5: 1000
  };
  
  for (let level = Object.keys(levels).length; level > 0; level--) {
    if (this.xp >= levels[level]) {
      return level;
    }
  }
  
  return 1;
};

UserSchema.methods.hasCompletedOnboarding = function(this: IUser): boolean {
  const requiredSteps = [
    'connect-wallet', 
    'claim-faucet', 
    'complete-tutorial'
  ];
  
  return requiredSteps.every(step => 
    this.onboardingSteps.includes(step)
  );
};

// Method to update Contribution XP
UserSchema.methods.updateContributionXP = function(amount: number): Promise<IUser> {
  this.contributionXP = (this.contributionXP || 0) + amount;
  return this.save();
};

// Static Methods
UserSchema.statics.findByWallet = async function(wallet: string) {
  return this.findOne({ wallet: wallet.toLowerCase() });
};

UserSchema.statics.createWithWallet = async function(wallet: string) {
  const user = new this({
    wallet: wallet.toLowerCase(),
    xp: 0,
    level: 1,
    onboardingSteps: [],
    onboardingCompleted: false,
    contributorStatus: ContributorStatus.NONE,
    contributionXP: 0 // Initialize contribution XP
  });
  
  return user.save();
};

// Static method to find top contributors
UserSchema.statics.findTopContributors = async function(limit: number = 10) {
  return this.find({ contributorStatus: ContributorStatus.APPROVED })
    .sort({ contributionXP: -1 })
    .limit(limit);
};

// Hooks
UserSchema.pre('save', function(next) {
  // Update level based on XP before saving
  if (this.isModified('xp')) {
    this.level = this.calculateLevel();
  }
  
  next();
});

// Indexes for performance
UserSchema.index({ wallet: 1 }, { unique: true });
UserSchema.index({ xp: -1 });
UserSchema.index({ contributorStatus: 1 });
UserSchema.index({ contributionXP: -1 });

// Extend mongoose model with additional statics
interface UserModel extends Model<IUser> {
  findByWallet(wallet: string): Promise<IUser | null>;
  createWithWallet(wallet: string): Promise<IUser>;
  findTopContributors(limit?: number): Promise<IUser[]>;
}

// Create and export the model
const User = mongoose.model<IUser, UserModel>('User', UserSchema);

export default User;