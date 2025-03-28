export declare const sendTokensFromFaucet: (recipientAddress: string, token: string, chain: string, amount: number) => Promise<{
    transactionHash: string;
    success: boolean;
}>;
export declare const calculateFaucetReward: (amount: number, token: "HLS" | "ETH") => number;
