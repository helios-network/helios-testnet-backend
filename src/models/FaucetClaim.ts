import mongoose, { Document, Schema, Model } from 'mongoose';

export enum FaucetClaimStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface IFaucetClaim extends Document {
  user: mongoose.Types.ObjectId;
  wallet: string;
  amount: number;
  token: string;
  chain: string;
  status: FaucetClaimStatus;
  transactionHash?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
  cooldownUntil?: Date;
}

const FaucetClaimSchema: Schema<IFaucetClaim> = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  wallet: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  token: {
    type: String,
    required: true,
    trim: true
  },
  chain: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(FaucetClaimStatus),
    default: FaucetClaimStatus.PENDING
  },
  transactionHash: {
    type: String,
    trim: true
  },
  errorMessage: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  cooldownUntil: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'faucet_claims'
});

// Indexes for performance and query optimization
FaucetClaimSchema.index({ user: 1, status: 1 });
FaucetClaimSchema.index({ wallet: 1, token: 1, chain: 1 });

// Static method to create a faucet claim
FaucetClaimSchema.statics.createClaim = async function(
  userId: string,
  wallet: string,
  amount: number,
  token: string,
  chain: string,
  metadata?: Record<string, any>
) {
  // Calculate cooldown
  const cooldownUntil = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours

  return this.create({
    user: userId,
    wallet: wallet.toLowerCase(),
    amount,
    token,
    chain,
    status: FaucetClaimStatus.PENDING,
    metadata,
    cooldownUntil
  });
};

// Static method to check if user is eligible for a claim
FaucetClaimSchema.statics.isEligibleForClaim = async function(
  wallet: string,
  token: string,
  chain: string
) {
  const recentClaim = await this.findOne({
    wallet: wallet.toLowerCase(),
    token,
    chain,
    status: FaucetClaimStatus.COMPLETED,
    createdAt: { 
      $gte: new Date(Date.now() - (24 * 60 * 60 * 1000)) 
    }
  });

  return !recentClaim;
};

interface FaucetClaimModel extends Model<IFaucetClaim> {
  createClaim(
    userId: string,
    wallet: string,
    amount: number,
    token: string,
    chain: string,
    metadata?: Record<string, any>
  ): Promise<IFaucetClaim>;

  isEligibleForClaim(
    wallet: string,
    token: string,
    chain: string
  ): Promise<boolean>;
}

const FaucetClaim = mongoose.model<IFaucetClaim, FaucetClaimModel>(
  'FaucetClaim', 
  FaucetClaimSchema
);

export default FaucetClaim;