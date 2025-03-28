"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFaucetReward = exports.sendTokensFromFaucet = void 0;
const ethers_1 = require("ethers");
const sendTokensFromFaucet = async (recipientAddress, token, chain, amount) => {
    console.log(`Sending ${amount} ${token} to ${recipientAddress} on ${chain}`);
    return {
        transactionHash: ethers_1.ethers.utils.id(`${recipientAddress}-${token}-${amount}`),
        success: true
    };
};
exports.sendTokensFromFaucet = sendTokensFromFaucet;
const calculateFaucetReward = (amount, token) => {
    const baseReward = 10;
    const multipliers = {
        'HLS': 2,
        'ETH': 1.5
    };
    return Math.round(baseReward *
        (multipliers[token] || 1) *
        Math.min(amount, 100));
};
exports.calculateFaucetReward = calculateFaucetReward;
//# sourceMappingURL=faucetService.js.map