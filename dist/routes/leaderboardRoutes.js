"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const leaderboardController_1 = require("../controllers/leaderboardController");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
router.get('/global', auth_1.protect, leaderboardController_1.getGlobalLeaderboard);
router.get('/contributors', auth_1.protect, leaderboardController_1.getContributorLeaderboard);
router.get('/user-rank', auth_1.protect, leaderboardController_1.getUserLeaderboardRank);
router.get('/stats', auth_1.protect, leaderboardController_1.getLeaderboardStats);
exports.default = router;
//# sourceMappingURL=leaderboardRoutes.js.map