"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middlewares/auth");
const userValidators_1 = require("../validators/userValidators");
const router = express_1.default.Router();
router.post('/register', (req, res, next) => {
    next();
}, userValidators_1.validateRegistration, auth_1.verifyWalletSignature, userController_1.registerUser);
router.get('/profile/:wallet', userController_1.getUserProfile);
router.put('/profile', auth_1.protect, userValidators_1.validateProfileUpdate, userController_1.updateUserProfile);
router.get('/stats/:wallet', userController_1.getUserStats);
router.get('/nfts/:wallet', userController_1.getUserNFTs);
router.get('/search', auth_1.protect, auth_1.restrictToAdmin, userController_1.searchUsers);
router.delete('/:wallet', auth_1.protect, auth_1.restrictToAdmin, async (req, res) => {
    try {
        const { wallet } = req.params;
        res.status(200).json({
            success: true,
            message: 'User account deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete user account',
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=userRoutes.js.map