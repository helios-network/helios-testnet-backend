"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const cosmwasm_stargate_1 = require("@cosmjs/cosmwasm-stargate");
const config_1 = __importDefault(require("../config"));
class BlockchainService {
    constructor() {
        this.cosmosClient = null;
        this.initializeProviders();
    }
    async initializeProviders() {
        this.evmProvider = new ethers_1.ethers.providers.JsonRpcProvider(config_1.default.EVM_RPC_URL);
        if (config_1.default.FAUCET_PRIVATE_KEY) {
            this.faucetWallet = new ethers_1.ethers.Wallet(config_1.default.FAUCET_PRIVATE_KEY, this.evmProvider);
        }
        try {
            this.cosmosClient = await cosmwasm_stargate_1.CosmWasmClient.connect(config_1.default.COSMOS_RPC_URL);
        }
        catch (error) {
            console.error('Failed to connect to Cosmos RPC:', error);
        }
    }
    async getEvmChainId() {
        try {
            const network = await this.evmProvider.getNetwork();
            return network.chainId;
        }
        catch (error) {
            console.error('Failed to get EVM chain ID:', error);
            throw new Error('Failed to connect to EVM blockchain');
        }
    }
    async getCosmosChainId() {
        try {
            if (!this.cosmosClient) {
                await this.initializeProviders();
            }
            if (this.cosmosClient) {
                return await this.cosmosClient.getChainId();
            }
            return null;
        }
        catch (error) {
            console.error('Failed to get Cosmos chain ID:', error);
            return null;
        }
    }
    async sendTokens(toAddress) {
        if (!this.faucetWallet) {
            throw new Error('Faucet wallet not initialized');
        }
        const tokenContractAddress = '0xTokenContractAddress';
        const tokenAbi = ['function transfer(address to, uint amount) returns (bool)'];
        const tokenContract = new ethers_1.ethers.Contract(tokenContractAddress, tokenAbi, this.faucetWallet);
        const tokenAmount = ethers_1.ethers.utils.parseUnits(config_1.default.FAUCET_TOKEN_AMOUNT, 18);
        try {
            const tx = await tokenContract.transfer(toAddress, tokenAmount);
            await tx.wait();
            return tx.hash;
        }
        catch (error) {
            console.error('Failed to send tokens:', error);
            throw new Error('Failed to send tokens from faucet');
        }
    }
}
exports.default = new BlockchainService();
//# sourceMappingURL=blockchainService.js.map