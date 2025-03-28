import mongoose, { Document, Schema, Model } from 'mongoose';
import { ContributorStatus } from '../models/User'; // Assuming you have this enum

export enum ContributorApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface IContributorApplication extends Document {
  user: mongoose.Types.ObjectId;
  wallet: string;
  fullName: string;
  email: string;
  resumeUrl?: string;
  githubProfile?: string;
  linkedinProfile?: string;
  skills: string[];
  applicationStatus: ContributorApplicationStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewNotes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ContributorApplicationSchema: Schema<IContributorApplication> = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  wallet: {
    type: String,
    required: true,
    lowercase: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  resumeUrl: {
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
      message: 'Invalid resume URL'
    }
  },
  githubProfile: {
    type: String,
    validate: {
      validator: function(v: string) {
        return /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/.test(v);
      },
      message: 'Invalid GitHub profile URL'
    }
  },
  linkedinProfile: {
    type: String,
    validate: {
      validator: function(v: string) {
        return /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/.test(v);
      },
      message: 'Invalid LinkedIn profile URL'
    }
  },
  skills: [{
    type: String,
    trim: true
  }],
  applicationStatus: {
    type: String,
    enum: Object.values(ContributorApplicationStatus),
    default: ContributorApplicationStatus.PENDING
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'contributor_applications'
});

// Indexes
ContributorApplicationSchema.index({ user: 1 }, { unique: true });
ContributorApplicationSchema.index({ wallet: 1 });
ContributorApplicationSchema.index({ applicationStatus: 1 });

interface ContributorApplicationModel extends Model<IContributorApplication> {
  findByUser(userId: string): Promise<IContributorApplication | null>;
  findByWallet(wallet: string): Promise<IContributorApplication | null>;
}

ContributorApplicationSchema.statics.findByUser = function(userId: string) {
  return this.findOne({ user: userId });
};

ContributorApplicationSchema.statics.findByWallet = function(wallet: string) {
  return this.findOne({ wallet: wallet.toLowerCase() });
};

const ContributorApplication = mongoose.model<IContributorApplication, ContributorApplicationModel>(
  'ContributorApplication', 
  ContributorApplicationSchema
);

export default ContributorApplication;