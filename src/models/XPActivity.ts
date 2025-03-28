import mongoose, { Document, Schema, Model } from 'mongoose';

// XP Activity Types
export enum XPActivityType {
  DAILY_CLAIM = 'daily_claim',
  TUTORIAL_COMPLETE = 'tutorial_complete',
  CONTRIBUTION = 'contribution',
  REFERRAL = 'referral',
  TRANSFER = 'transfer',
  ADMIN_GRANT = 'admin_grant',
  FAUCET_CLAIM = 'faucet_claim',
  ONBOARDING = 'onboarding',
  ONBOARDING_REWARD = 'onboarding_reward'
}

export interface IXPActivity extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  type: XPActivityType;
  description?: string;
  metadata?: Record<string, any>;
  relatedUser?: mongoose.Types.ObjectId;
  timestamp: Date;
}

const XPActivitySchema: Schema<IXPActivity> = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(XPActivityType),
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'xp_activities'
});

// Indexes for performance
XPActivitySchema.index({ user: 1, timestamp: -1 });
XPActivitySchema.index({ type: 1, timestamp: -1 });

// Static method to log XP activity
XPActivitySchema.statics.logActivity = async function(
  userId: string, 
  amount: number, 
  type: XPActivityType, 
  description?: string,
  metadata?: Record<string, any>,
  relatedUser?: string
) {
  const activity = new this({
    user: userId,
    amount,
    type,
    description,
    metadata,
    relatedUser
  });

  return activity.save();
};

interface XPActivityModel extends Model<IXPActivity> {
  logActivity(
    userId: string, 
    amount: number, 
    type: XPActivityType, 
    description?: string,
    metadata?: Record<string, any>,
    relatedUser?: string
  ): Promise<IXPActivity>;
}

const XPActivity = mongoose.model<IXPActivity, XPActivityModel>(
  'XPActivity', 
  XPActivitySchema
);

export default XPActivity;