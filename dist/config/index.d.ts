declare const config: {
    NODE_ENV: string;
    PORT: number;
    MONGODB_URI: string;
    EVM_RPC_URL: string;
    COSMOS_RPC_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    FAUCET_PRIVATE_KEY: string | undefined;
    FAUCET_TOKEN_AMOUNT: string;
    FAUCET_COOLDOWN_HOURS: number;
    XP_LEVELS: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
        6: number;
        7: number;
        8: number;
        9: number;
        10: number;
    };
    ADMIN_WALLETS: string[];
    SIGNATURE_DOMAIN: string;
    SIGNATURE_VERSION: string;
    DAILY_XP_AMOUNT: number;
    MAX_XP_TRANSFER: number;
    ONBOARDING_REWARD_XP: number;
    ONBOARDING_REWARD_NFT: string;
    FAUCET_TOKENS: {
        token: string;
        chain: string;
        maxClaimAmount: number;
        cooldownHours: number;
    }[];
};
export default config;
