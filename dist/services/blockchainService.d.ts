declare class BlockchainService {
    private evmProvider;
    private faucetWallet;
    private cosmosClient;
    constructor();
    private initializeProviders;
    getEvmChainId(): Promise<number>;
    getCosmosChainId(): Promise<string | null>;
    sendTokens(toAddress: string): Promise<string>;
}
declare const _default: BlockchainService;
export default _default;
