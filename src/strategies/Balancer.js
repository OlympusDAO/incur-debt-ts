"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Balancer = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const abis_1 = require("../metadata/abis");
const addresses_1 = require("../metadata/addresses");
class Balancer {
    constructor(sender, poolId, tokens, tokenAmounts, slippage = 0.01, ohmAmount, provider) {
        this.msgSender = sender;
        this.vault = new ethers_1.Contract(addresses_1.BalancerVaultAddress, Balancer.abi, provider);
        this.balancerHelpers = new ethers_1.Contract(addresses_1.BalancerHelperAddress, abis_1.BalancerHelpersABI, provider);
        this.pool = poolId;
        this.ohmToBorrow = ohmAmount;
        tokens.push(addresses_1.OhmAddress);
        this.assets = tokens.sort(); // Not sure if this works because they're addresses that according to Balancer need to be sorted numerically
        tokenAmounts.push(this.ohmToBorrow);
        this.assetAmounts = tokenAmounts.sort(); // This does not work because the amounts need to be sorted based on address order, not alphabetical order of the amounts
        this.acceptableSlippage = (1 - slippage) * 1000;
    }
    async getPoolTokens() {
        if (!this.vault || !this.pool)
            throw new Error("Vault and liquidity pool not initialized");
        const { tokens, balances, lastTimestamp } = await this.vault.getPoolTokens(this.pool);
        return tokens;
    }
    async verifyOtherTokens() {
        if (!this.vault || !this.pool)
            throw new Error("Vault and liquidity pool not initialized");
        const poolTokens = await this.getPoolTokens();
        for (let i = 0; i < this.assets.length; i++) {
            if (!poolTokens.includes(this.assetAmounts[i]))
                return false;
        }
        return true;
    }
    async getAddLiquidityCalldata() {
        if (!this.verifyOtherTokens())
            throw new Error("Passed tokens do not match the pool.");
        const userData = utils_1.defaultAbiCoder.encode(["enum", "uint256", "uint256"], [1, this.assetAmounts, 0]);
        const joinPoolRequest = {
            assets: this.assets,
            maxAmountsIn: this.assetAmounts,
            userData: userData,
            fromInternalBalance: false,
        };
        const expectedPoolTokensOut = await this.balancerHelpers.callStatic.queryJoin(this.pool, addresses_1.IncurDebtAddress, this.msgSender, joinPoolRequest);
        const minPoolTokensOut = ethers_1.BigNumber.from(expectedPoolTokensOut)
            .mul(this.acceptableSlippage)
            .div("1000");
        const encodedParams = utils_1.defaultAbiCoder.encode(["bytes", "address[]", "uint256[]", "uint256"], [this.pool, this.assets, this.assetAmounts, minPoolTokensOut]);
        return encodedParams;
    }
}
exports.Balancer = Balancer;
Balancer.abi = abis_1.BalancerVaultABI;
