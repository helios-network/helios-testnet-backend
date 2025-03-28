import mongoose, { Document, Model } from 'mongoose';
export declare enum ContributorApplicationStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
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
    createdAt: Date;
    updatedAt: Date;
}
interface ContributorApplicationModel extends Model<IContributorApplication> {
    findByUser(userId: string): Promise<IContributorApplication | null>;
    findByWallet(wallet: string): Promise<IContributorApplication | null>;
}
declare const ContributorApplication: ContributorApplicationModel;
export default ContributorApplication;
