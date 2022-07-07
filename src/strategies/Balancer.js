"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        this.otherTokens = tokens;
        this.otherTokenAmounts = tokenAmounts;
        this.acceptableSlippage = 1 - slippage;
        this.ohmToBorrow = ohmAmount;
    }
    getPoolTokens() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.vault || !this.pool)
                throw new Error("Vault and liquidity pool not initialized");
            const { tokens, balances, lastTimestamp } = yield this.vault.getPoolTokens(this.pool);
            return tokens;
        });
    }
    verifyOtherTokens() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.vault || !this.pool)
                throw new Error("Vault and liquidity pool not initialized");
            const poolTokens = yield this.getPoolTokens();
            for (let i = 0; i < this.otherTokens.length; i++) {
                if (!poolTokens.includes(this.otherTokens[i]))
                    return false;
            }
            return true;
        });
    }
    getEncodedParams() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.verifyOtherTokens())
                throw new Error("Passed tokens do not match the pool.");
            const userData = utils_1.defaultAbiCoder.encode(["enum", "uint256", "uint256"], [1, this.otherTokenAmounts, 0]);
            const joinPoolRequest = {
                assets: this.otherTokens,
                maxAmountsIn: this.otherTokenAmounts,
                userData: userData,
                fromInternalBalance: false,
            };
            const minPoolTokensOut = yield this.balancerHelpers.callStatic.queryJoin(this.pool, addresses_1.IncurDebtAddress, this.msgSender, joinPoolRequest);
            const encodedParams = utils_1.defaultAbiCoder.encode(["bytes", "address[]", "uint256[]", "uint256"], [
                this.pool,
                this.otherTokens,
                this.otherTokenAmounts,
                minPoolTokensOut,
            ]);
            return encodedParams;
        });
    }
}
exports.Balancer = Balancer;
Balancer.abi = abis_1.BalancerVaultABI;
