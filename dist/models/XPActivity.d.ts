import mongoose, { Document, Model } from 'mongoose';
export declare enum XPActivityType {
    DAILY_CLAIM = "daily_claim",
    TUTORIAL_COMPLETE = "tutorial_complete",
    CONTRIBUTION = "contribution",
    REFERRAL = "referral",
    TRANSFER = "transfer",
    ADMIN_GRANT = "admin_grant",
    FAUCET_CLAIM = "faucet_claim",
    ONBOARDING = "onboarding",
    ONBOARDING_REWARD = "onboarding_reward"
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
interface XPActivityModel extends Model<IXPActivity> {
    logActivity(userId: string, amount: number, type: XPActivityType, description?: string, metadata?: Record<string, any>, relatedUser?: string): Promise<IXPActivity>;
}
declare const XPActivity: XPActivityModel;
export default XPActivity;
