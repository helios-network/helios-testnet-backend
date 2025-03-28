"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const config = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/helios-testnet',
    EVM_RPC_URL: process.env.EVM_RPC_URL || 'http://localhost:8545',
    COSMOS_RPC_URL: process.env.COSMOS_RPC_URL || 'http://localhost:26657',
    JWT_SECRET: process.env.JWT_SECRET || 'helios-super-secret-jwt-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    FAUCET_PRIVATE_KEY: process.env.FAUCET_PRIVATE_KEY,
    FAUCET_TOKEN_AMOUNT: process.env.FAUCET_TOKEN_AMOUNT || '10',
    FAUCET_COOLDOWN_HOURS: process.env.FAUCET_COOLDOWN_HOURS
        ? parseInt(process.env.FAUCET_COOLDOWN_HOURS, 10)
        : 24,
    XP_LEVELS: {
        1: 0,
        2: 100,
        3: 250,
        4: 500,
        5: 1000,
        6: 2000,
        7: 3500,
        8: 5000,
        9: 7500,
        10: 10000,
    },
    ADMIN_WALLETS: (process.env.ADMIN_WALLETS || '').split(',').filter(Boolean),
    SIGNATURE_DOMAIN: 'Helios Testnet',
    SIGNATURE_VERSION: '1',
    DAILY_XP_AMOUNT: 50,
    MAX_XP_TRANSFER: 100,
    ONBOARDING_REWARD_XP: 500,
    ONBOARDING_REWARD_NFT: 'onboarding-nft-token-id',
    FAUCET_TOKENS: [
        {
            token: 'HLS',
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
    ]
};
exports.default = config;
//# sourceMappingURL=index.js.map