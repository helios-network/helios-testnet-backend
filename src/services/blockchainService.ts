import { ethers } from 'ethers';
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import config from '../config';

class BlockchainService {
  private evmProvider: ethers.providers.JsonRpcProvider;
  private faucetWallet: ethers.Wallet;
  private cosmosClient: CosmWasmClient | null = null;

  constructor() {
    this.initializeProviders();
  }

  private async initializeProviders() {
    // Initialize EVM provider
    this.evmProvider = new ethers.providers.JsonRpcProvider(config.EVM_RPC_URL);
    
    // Initialize faucet wallet if private key is available
    if (config.FAUCET_PRIVATE_KEY) {
      this.faucetWallet = new ethers.Wallet(
        config.FAUCET_PRIVATE_KEY,
        this.evmProvider
      );
    }
    
    // Initialize Cosmos client
    try {
      this.cosmosClient = await CosmWasmClient.connect(config.COSMOS_RPC_URL);
    } catch (error) {
      console.error('Failed to connect to Cosmos RPC:', error);
    }
  }

  async getEvmChainId(): Promise<number> {
    try {
      const network = await this.evmProvider.getNetwork();
      return network.chainId;
    } catch (error) {
      console.error('Failed to get EVM chain ID:', error);
      throw new Error('Failed to connect to EVM blockchain');
    }
  }

  async getCosmosChainId(): Promise<string | null> {
    try {
      if (!this.cosmosClient) {
        await this.initializeProviders();
      }
      if (this.cosmosClient) {
        return await this.cosmosClient.getChainId();
      }
      return null;
    } catch (error) {
      console.error('Failed to get Cosmos chain ID:', error);
      return null;
    }
  }

  async sendTokens(toAddress: string): Promise<string> {
    if (!this.faucetWallet) {
      throw new Error('Faucet wallet not initialized');
    }
    
    // For HLS token transfers, you would typically interact with the token contract
    // This is a simplified example - you'd replace this with your actual token contract
    const tokenContractAddress = '0xTokenContractAddress';
    const tokenAbi = ['function transfer(address to, uint amount) returns (bool)'];
    const tokenContract = new ethers.Contract(
      tokenContractAddress,
      tokenAbi,
      this.faucetWallet
    );
    
    const tokenAmount = ethers.utils.parseUnits(
      config.FAUCET_TOKEN_AMOUNT,
      18 // Assuming 18 decimals for the token
    );
    
    try {
      const tx = await tokenContract.transfer(toAddress, tokenAmount);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to send tokens:', error);
      throw new Error('Failed to send tokens from faucet');
    }
  }
  
  // Add more blockchain interaction methods as needed
}

export default new BlockchainService();