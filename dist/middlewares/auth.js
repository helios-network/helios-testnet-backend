"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWalletSignature = exports.generateToken = exports.restrictToAdmin = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const config_1 = __importDefault(require("../config"));
const protect = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token, authorization denied'
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.JWT_SECRET);
        const user = await User_1.default.findOne({
            wallet: decoded.wallet.toLowerCase()
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token is not valid',
            error: error.message
        });
    }
};
exports.protect = protect;
const restrictToAdmin = (req, res, next) => {
    if (!req.user || req.user.contributorStatus !== 'approved') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin rights required.'
        });
    }
    next();
};
exports.restrictToAdmin = restrictToAdmin;
const generateToken = (wallet) => {
    const payload = {
        wallet
    };
    const options = {
        expiresIn: Number(config_1.default.JWT_EXPIRES_IN)
    };
    return jsonwebtoken_1.default.sign(payload, config_1.default.JWT_SECRET, options);
};
exports.generateToken = generateToken;
const verifyWalletSignature = async (req, res, next) => {
    try {
        const { wallet, signature } = req.body;
        if (!wallet || !signature) {
            return res.status(400).json({
                success: false,
                message: 'Wallet and signature are required'
            });
        }
        const isValidSignature = true;
        if (!isValidSignature) {
            return res.status(401).json({
                success: false,
                message: 'Invalid wallet signature'
            });
        }
        next();
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Signature verification failed',
            error: error.message
        });
    }
};
exports.verifyWalletSignature = verifyWalletSignature;
//# sourceMappingURL=auth.js.map