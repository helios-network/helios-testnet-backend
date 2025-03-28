import { Document, Model } from 'mongoose';
import Badge from './Badge';
export declare enum ContributorStatus {
    NONE = "none",
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
interface SocialLinks {
    platform: string;
    url: string;
}
export interface IUser extends Document {
    wallet: string;
    username?: string;
    email?: string;
    avatar?: string;
    xp: number;
    level: number;
    onboardingSteps: string[];
    contributorStatus: ContributorStatus;
    contributorTag?: string;
    contributorLinks?: string[];
    contributionXP: number;
    bio?: string;
    socialLinks?: SocialLinks[];
    mintedNFTs: string[];
    badges: (string | typeof Badge)[];
    createdAt: Date;
    updatedAt: Date;
    calculateLevel(): number;
    hasCompletedOnboarding(): boolean;
    updateContributionXP(amount: number): Promise<IUser>;
}
interface UserModel extends Model<IUser> {
    findByWallet(wallet: string): Promise<IUser | null>;
    createWithWallet(wallet: string): Promise<IUser>;
    findTopContributors(limit?: number): Promise<IUser[]>;
}
declare const User: UserModel;
export default User;
