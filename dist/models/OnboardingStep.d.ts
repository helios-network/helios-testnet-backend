import mongoose, { Document, Model } from 'mongoose';
export declare enum OnboardingStepStatus {
    NOT_STARTED = "not_started",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed"
}
export interface IOnboardingStep extends Document {
    user: mongoose.Types.ObjectId;
    stepKey: string;
    status: OnboardingStepStatus;
    startedAt?: Date;
    completedAt?: Date;
    metadata?: Record<string, any>;
}
export declare const PREDEFINED_ONBOARDING_STEPS: string[];
interface OnboardingStepModel extends Model<IOnboardingStep> {
    processStep(userId: string, stepKey: string, metadata?: Record<string, any>): Promise<IOnboardingStep>;
}
declare const OnboardingStep: OnboardingStepModel;
export default OnboardingStep;
