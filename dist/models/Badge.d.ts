import { Document, Model } from 'mongoose';
export declare enum BadgeRarity {
    COMMON = "common",
    RARE = "rare",
    EPIC = "epic",
    LEGENDARY = "legendary"
}
export declare enum BadgeType {
    ACHIEVEMENT = "achievement",
    CONTRIBUTION = "contribution",
    SPECIAL_EVENT = "special_event",
    MILESTONE = "milestone"
}
export interface IBadge extends Document {
    name: string;
    description: string;
    imageUrl: string;
    rarity: BadgeRarity;
    type: BadgeType;
    requiredCondition?: string;
    xpReward?: number;
    createdAt: Date;
    updatedAt: Date;
}
interface BadgeModel extends Model<IBadge> {
    findByType(type: BadgeType): Promise<IBadge[]>;
    findByRarity(rarity: BadgeRarity): Promise<IBadge[]>;
}
declare const Badge: BadgeModel;
export default Badge;
