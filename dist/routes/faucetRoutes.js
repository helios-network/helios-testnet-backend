"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const faucetController_1 = require("../controllers/faucetController");
const auth_1 = require("../middlewares/auth");
const faucetValidators_1 = require("../validators/faucetValidators");
const router = express_1.default.Router();
router.post('/request', auth_1.protect, faucetValidators_1.validateFaucetTokenRequest, faucetController_1.requestFaucetTokens);
router.get('/history', auth_1.protect, faucetController_1.getFaucetClaimHistory);
router.post('/check-eligibility', auth_1.protect, faucetValidators_1.validateFaucetEligibilityCheck, faucetController_1.checkFaucetEligibility);
router.get('/available-tokens', async (req, res) => {
    try {
        const availableTokens = [
            {
                token: 'HLOS',
                chain: 'helios-testnet',
                maxClaimAmount: 100,
                cooldownHours: 24
            },
            {
                token: 'ETH',
                chain: 'goerli',
                maxClaimAmount: 0.1,
                cooldownHours: 24
            }
        ];
        res.status(200).json({
            success: true,
            tokens: availableTokens
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve available tokens',
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=faucetRoutes.js.map