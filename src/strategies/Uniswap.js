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
exports.Uniswap = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const abis_1 = require("../metadata/abis");
const addresses_1 = require("../metadata/addresses");
class Uniswap {
    constructor(lpAddress, slippage = 0.01, ohmAmount, provider) {
        this.liquidityPool = new ethers_1.Contract(lpAddress, Uniswap.abi, provider);
        this.acceptableSlippage = 1 - slippage;
        this.ohmToBorrow = ohmAmount;
    }
    getTokenA() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.liquidityPool)
                throw new Error("Liquidity pool not initialized");
            return this.liquidityPool.token0();
        });
    }
    getTokenB() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.liquidityPool)
                throw new Error("Liquidity pool not initialized");
            return this.liquidityPool.token1();
        });
    }
    getReserveRatio() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.liquidityPool)
                throw new Error("Liquidity pool not initialized");
            const { reserves0, reserves1, lastTimestamp } = yield this.liquidityPool.getReserves();
            const reserveRatio = ethers_1.BigNumber.from(reserves0).div(ethers_1.BigNumber.from(reserves1));
            return reserveRatio.toString();
        });
    }
    getEncodedParams() {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenA = yield this.getTokenA();
            let tokenAAmount;
            let minTokenAOut;
            const tokenB = yield this.getTokenB();
            let tokenBAmount;
            let minTokenBOut;
            const reserveRatio = yield this.getReserveRatio();
            if (tokenA == addresses_1.OhmAddress) {
                tokenAAmount = this.ohmToBorrow;
                minTokenAOut = ethers_1.BigNumber.from(tokenAAmount)
                    .mul(this.acceptableSlippage)
                    .toString();
                tokenBAmount = ethers_1.BigNumber.from(tokenAAmount)
                    .div(reserveRatio)
                    .toString();
                minTokenBOut = ethers_1.BigNumber.from(tokenBAmount)
                    .mul(this.acceptableSlippage)
                    .toString();
            }
            else {
                tokenBAmount = this.ohmToBorrow;
                minTokenBOut = ethers_1.BigNumber.from(tokenBAmount)
                    .mul(this.acceptableSlippage)
                    .toString();
                tokenAAmount = ethers_1.BigNumber.from(tokenBAmount)
                    .mul(reserveRatio)
                    .toString();
                minTokenAOut = ethers_1.BigNumber.from(tokenAAmount)
                    .mul(this.acceptableSlippage)
                    .toString();
            }
            const encodedParams = utils_1.defaultAbiCoder.encode(["address", "address", "uint256", "uint256", "uint256", "uint256"], [
                tokenA,
                tokenB,
                tokenAAmount,
                tokenBAmount,
                minTokenAOut,
                minTokenBOut,
            ]);
            return encodedParams;
        });
    }
}
exports.Uniswap = Uniswap;
Uniswap.abi = abis_1.UniswapV2ABI;
