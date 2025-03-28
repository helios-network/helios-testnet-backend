"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const xpController_1 = require("../controllers/xpController");
const auth_1 = require("../middlewares/auth");
const xpValidators_1 = require("../validators/xpValidators");
const router = express_1.default.Router();
router.post('/daily-claim', auth_1.protect, xpValidators_1.validateDailyXPClaim, xpController_1.claimDailyXP);
router.post('/log-activity', auth_1.protect, xpValidators_1.validateActivityLog, xpController_1.logActivity);
router.post('/transfer', auth_1.protect, xpValidators_1.validateXPTransfer, xpController_1.transferXP);
router.get('/leaderboard', xpController_1.getXPLeaderboard);
router.get('/history', auth_1.protect, xpController_1.getUserXPHistory);
router.get('/admin/activities', auth_1.protect, auth_1.restrictToAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 50, sortBy = 'timestamp', sortOrder = 'desc' } = req.query;
        res.status(200).json({
            success: true,
            message: 'XP Activities retrieved'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve XP activities',
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=xpRoutes.js.map