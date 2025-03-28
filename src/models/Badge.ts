import mongoose, { Document, Schema, Model } from 'mongoose';

// Badge Rarity Enum
export enum BadgeRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

// Badge Type Enum
export enum BadgeType {
  ACHIEVEMENT = 'achievement',
  CONTRIBUTION = 'contribution',
  SPECIAL_EVENT = 'special_event',
  MILESTONE = 'milestone'
}

// Badge Interface
export interface IBadge extends Document {
  name: string;
  description: string;
  imageUrl: string;
  rarity: BadgeRarity;
  type: BadgeType;
  requiredCondition?: string;
  xpReward?: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Badge Schema
const BadgeSchema: Schema<IBadge> = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  imageUrl: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  rarity: {
    type: String,
    enum: Object.values(BadgeRarity),
    default: BadgeRarity.COMMON
  },
  type: {
    type: String,
    enum: Object.values(BadgeType),
    default: BadgeType.ACHIEVEMENT
  },
  requiredCondition: {
    type: String,
    trim: true
  },
  xpReward: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  collection: 'badges'
});

// Static method to find badges by type
BadgeSchema.statics.findByType = function(type: BadgeType) {
  return this.find({ type });
};

// Static method to find badges by rarity
BadgeSchema.statics.findByRarity = function(rarity: BadgeRarity) {
  return this.find({ rarity });
};

// Extend mongoose model with additional statics
interface BadgeModel extends Model<IBadge> {
  findByType(type: BadgeType): Promise<IBadge[]>;
  findByRarity(rarity: BadgeRarity): Promise<IBadge[]>;
}

// Create and export the model
const Badge = mongoose.model<IBadge, BadgeModel>('Badge', BadgeSchema);

export default Badge;