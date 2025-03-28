import mongoose, { Document, Schema, Model } from 'mongoose';

export enum OnboardingStepStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export interface IOnboardingStep extends Document {
  user: mongoose.Types.ObjectId;
  stepKey: string;
  status: OnboardingStepStatus;
  startedAt?: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

const OnboardingStepSchema: Schema<IOnboardingStep> = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  stepKey: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  status: {
    type: String,
    enum: Object.values(OnboardingStepStatus),
    default: OnboardingStepStatus.NOT_STARTED
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  collection: 'onboarding_steps'
});

// Compound unique index to prevent duplicate steps for a user
OnboardingStepSchema.index({ user: 1, stepKey: 1 }, { unique: true });

// Static method to create or update onboarding step
OnboardingStepSchema.statics.processStep = async function(
  userId: string, 
  stepKey: string, 
  metadata?: Record<string, any>
) {
  const update: Partial<IOnboardingStep> = {
    status: OnboardingStepStatus.COMPLETED,
    completedAt: new Date(),
    metadata
  };

  // If step doesn't exist, create it with started and completed timestamps
  return this.findOneAndUpdate(
    { user: userId, stepKey },
    {
      $set: {
        user: userId,
        stepKey,
        startedAt: new Date(),
        ...update
      }
    },
    { 
      upsert: true, 
      new: true,
      setDefaultsOnInsert: true 
    }
  );
};

// Define predefined onboarding steps
export const PREDEFINED_ONBOARDING_STEPS = [
  'connect_wallet',
  'complete_profile',
  'verify_email',
  'join_discord',
  'complete_tutorial',
  'first_transaction'
];

interface OnboardingStepModel extends Model<IOnboardingStep> {
  processStep(
    userId: string, 
    stepKey: string, 
    metadata?: Record<string, any>
  ): Promise<IOnboardingStep>;
}

const OnboardingStep = mongoose.model<IOnboardingStep, OnboardingStepModel>(
  'OnboardingStep', 
  OnboardingStepSchema
);

export default OnboardingStep;