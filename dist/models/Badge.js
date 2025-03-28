"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadgeType = exports.BadgeRarity = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var BadgeRarity;
(function (BadgeRarity) {
    BadgeRarity["COMMON"] = "common";
    BadgeRarity["RARE"] = "rare";
    BadgeRarity["EPIC"] = "epic";
    BadgeRarity["LEGENDARY"] = "legendary";
})(BadgeRarity || (exports.BadgeRarity = BadgeRarity = {}));
var BadgeType;
(function (BadgeType) {
    BadgeType["ACHIEVEMENT"] = "achievement";
    BadgeType["CONTRIBUTION"] = "contribution";
    BadgeType["SPECIAL_EVENT"] = "special_event";
    BadgeType["MILESTONE"] = "milestone";
})(BadgeType || (exports.BadgeType = BadgeType = {}));
const BadgeSchema = new mongoose_1.Schema({
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
            validator: function (v) {
                try {
                    new URL(v);
                    return true;
                }
                catch {
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
BadgeSchema.statics.findByType = function (type) {
    return this.find({ type });
};
BadgeSchema.statics.findByRarity = function (rarity) {
    return this.find({ rarity });
};
const Badge = mongoose_1.default.model('Badge', BadgeSchema);
exports.default = Badge;
//# sourceMappingURL=Badge.js.map