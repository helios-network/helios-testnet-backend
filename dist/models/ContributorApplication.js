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
exports.ContributorApplicationStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var ContributorApplicationStatus;
(function (ContributorApplicationStatus) {
    ContributorApplicationStatus["PENDING"] = "pending";
    ContributorApplicationStatus["APPROVED"] = "approved";
    ContributorApplicationStatus["REJECTED"] = "rejected";
})(ContributorApplicationStatus || (exports.ContributorApplicationStatus = ContributorApplicationStatus = {}));
const ContributorApplicationSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    wallet: {
        type: String,
        required: true,
        lowercase: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    resumeUrl: {
        type: String,
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
            message: 'Invalid resume URL'
        }
    },
    githubProfile: {
        type: String,
        validate: {
            validator: function (v) {
                return /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/.test(v);
            },
            message: 'Invalid GitHub profile URL'
        }
    },
    linkedinProfile: {
        type: String,
        validate: {
            validator: function (v) {
                return /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/.test(v);
            },
            message: 'Invalid LinkedIn profile URL'
        }
    },
    skills: [{
            type: String,
            trim: true
        }],
    applicationStatus: {
        type: String,
        enum: Object.values(ContributorApplicationStatus),
        default: ContributorApplicationStatus.PENDING
    },
    reviewedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewNotes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    collection: 'contributor_applications'
});
ContributorApplicationSchema.index({ user: 1 }, { unique: true });
ContributorApplicationSchema.index({ wallet: 1 });
ContributorApplicationSchema.index({ applicationStatus: 1 });
ContributorApplicationSchema.statics.findByUser = function (userId) {
    return this.findOne({ user: userId });
};
ContributorApplicationSchema.statics.findByWallet = function (wallet) {
    return this.findOne({ wallet: wallet.toLowerCase() });
};
const ContributorApplication = mongoose_1.default.model('ContributorApplication', ContributorApplicationSchema);
exports.default = ContributorApplication;
//# sourceMappingURL=ContributorApplication.js.map