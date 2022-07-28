"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Balancer = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const abis_1 = require("../metadata/abis");
const addresses_1 = require("../metadata/addresses");
class Balancer {
    constructor(sender, poolId, tokens, tokenAmounts, slippage = 0.01, ohmAmount, provider, chainId) {
        this.incurDebtAddress = (0, addresses_1.IncurDebtAddress)(chainId);
        this.msgSender = sender;
        this.vault = new ethers_1.Contract(addresses_1.BalancerVaultAddress, Balancer.abi, provider);
        this.balancerHelpers = new ethers_1.Contract(addresses_1.BalancerHelperAddress, abis_1.BalancerHelpersABI, provider);
        this.pool = poolId;
        this.ohmToBorrow = ohmAmount;
        tokens.push((0, addresses_1.OhmAddress)(chainId));
        tokenAmounts.push(this.ohmToBorrow);
        this.assetAmounts = tokenAmounts.sort((a, b) => {
            const indexOfA = tokenAmounts.indexOf(a);
            const indexOfB = tokenAmounts.indexOf(b);
            if (ethers_1.BigNumber.from(tokens[indexOfA]).gt(tokens[indexOfB]))
                return 1;
            if (ethers_1.BigNumber.from(tokens[indexOfA]).lt(tokens[indexOfB]))
                return -1;
            return 0;
        });
        this.assets = tokens.sort((a, b) => {
            if (ethers_1.BigNumber.from(a).gt(b))
                return 1;
            if (ethers_1.BigNumber.from(a).lt(b))
                return -1;
            return 0;
        });
        this.acceptableSlippage = (1 - slippage) * 1000;
    }
    async getPoolTokens() {
        if (!this.vault || !this.pool)
            throw new Error("Vault and liquidity pool not initialized");
        const poolTokensResults = await this.vault.getPoolTokens(this.pool);
        return poolTokensResults[0].toString();
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
        const userData = utils_1.defaultAbiCoder.encode(["uint256", "uint256[]", "uint256"], [1, this.assetAmounts, 0]);
        const joinPoolRequest = {
            assets: this.assets,
            maxAmountsIn: this.assetAmounts,
            userData: userData,
            fromInternalBalance: false,
        };
        const expectedPoolTokensOut = await this.balancerHelpers.callStatic.queryJoin(this.pool, this.incurDebtAddress, this.msgSender, joinPoolRequest);
        const minPoolTokensOut = expectedPoolTokensOut[0]
            .mul(this.acceptableSlippage)
            .div("1000");
        const encodedParams = utils_1.defaultAbiCoder.encode(["bytes32", "address[]", "uint256[]", "uint256"], [this.pool, this.assets, this.assetAmounts, minPoolTokensOut]);
        return encodedParams;
    }
}
exports.Balancer = Balancer;
Balancer.abi = abis_1.BalancerVaultABI;
