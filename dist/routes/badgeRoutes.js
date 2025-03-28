"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const badgeController_1 = require("../controllers/badgeController");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
router.get('/', auth_1.protect, badgeController_1.getAllBadges);
router.get('/user', auth_1.protect, badgeController_1.getUserBadges);
router.get('/:id', auth_1.protect, badgeController_1.getBadgeDetails);
router.post('/', auth_1.protect, auth_1.restrictToAdmin, badgeController_1.createBadge);
router.post('/assign', auth_1.protect, auth_1.restrictToAdmin, badgeController_1.assignBadgeToUser);
router.patch('/:id', auth_1.protect, auth_1.restrictToAdmin, badgeController_1.updateBadge);
router.delete('/:id', auth_1.protect, auth_1.restrictToAdmin, badgeController_1.deleteBadge);
exports.default = router;
//# sourceMappingURL=badgeRoutes.js.map