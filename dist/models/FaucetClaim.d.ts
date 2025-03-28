import mongoose, { Document, Model } from 'mongoose';
export declare enum FaucetClaimStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed"
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
interface FaucetClaimModel extends Model<IFaucetClaim> {
    createClaim(userId: string, wallet: string, amount: number, token: string, chain: string, metadata?: Record<string, any>): Promise<IFaucetClaim>;
    isEligibleForClaim(wallet: string, token: string, chain: string): Promise<boolean>;
}
declare const FaucetClaim: FaucetClaimModel;
export default FaucetClaim;
