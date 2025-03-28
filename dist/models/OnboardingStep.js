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
exports.PREDEFINED_ONBOARDING_STEPS = exports.OnboardingStepStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var OnboardingStepStatus;
(function (OnboardingStepStatus) {
    OnboardingStepStatus["NOT_STARTED"] = "not_started";
    OnboardingStepStatus["IN_PROGRESS"] = "in_progress";
    OnboardingStepStatus["COMPLETED"] = "completed";
})(OnboardingStepStatus || (exports.OnboardingStepStatus = OnboardingStepStatus = {}));
const OnboardingStepSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
        type: mongoose_1.default.Schema.Types.Mixed
    }
}, {
    timestamps: true,
    collection: 'onboarding_steps'
});
OnboardingStepSchema.index({ user: 1, stepKey: 1 }, { unique: true });
OnboardingStepSchema.statics.processStep = async function (userId, stepKey, metadata) {
    const update = {
        status: OnboardingStepStatus.COMPLETED,
        completedAt: new Date(),
        metadata
    };
    return this.findOneAndUpdate({ user: userId, stepKey }, {
        $set: {
            user: userId,
            stepKey,
            startedAt: new Date(),
            ...update
        }
    }, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
    });
};
exports.PREDEFINED_ONBOARDING_STEPS = [
    'connect_wallet',
    'complete_profile',
    'verify_email',
    'join_discord',
    'complete_tutorial',
    'first_transaction'
];
const OnboardingStep = mongoose_1.default.model('OnboardingStep', OnboardingStepSchema);
exports.default = OnboardingStep;
//# sourceMappingURL=OnboardingStep.js.map