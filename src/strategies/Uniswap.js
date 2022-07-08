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
        this.provider = provider;
        this.liquidityPool = new ethers_1.Contract(lpAddress, Uniswap.abi, this.provider);
        this.acceptableSlippage = (1 - slippage) * 1000;
        this.ohmToBorrow = ohmAmount;
    }
    getTokenA() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.liquidityPool)
                throw new Error("Liquidity pool not initialized");
            return this.liquidityPool.token0();
        });
    }
    getTokenADecimals() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.liquidityPool)
                throw new Error("Liquidity pool not initialized");
            const tokenAAddress = yield this.getTokenA();
            const tokenAContract = new ethers_1.Contract(tokenAAddress, abis_1.ERC20ABI, this.provider);
            const tokenADecimals = yield tokenAContract.decimals();
            return tokenADecimals;
        });
    }
    getTokenB() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.liquidityPool)
                throw new Error("Liquidity pool not initialized");
            return this.liquidityPool.token1();
        });
    }
    getTokenBDecimals() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.liquidityPool)
                throw new Error("Liquidity pool not initialized");
            const tokenBAddress = yield this.getTokenB();
            const tokenBContract = new ethers_1.Contract(tokenBAddress, abis_1.ERC20ABI, this.provider);
            const tokenBDecimals = yield tokenBContract.decimals();
            return tokenBDecimals;
        });
    }
    getReserveRatio() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.liquidityPool)
                throw new Error("Liquidity pool not initialized");
            const reservesInfo = yield this.liquidityPool.getReserves();
            const reservesA = reservesInfo[0];
            const tokenADecimals = yield this.getTokenADecimals();
            const reservesB = reservesInfo[1];
            const tokenBDecimals = yield this.getTokenBDecimals();
            const isPrecisionEqual = ethers_1.BigNumber.from(tokenADecimals).eq(tokenBDecimals);
            const isTokenAMorePrecise = ethers_1.BigNumber.from(tokenADecimals).gt(tokenBDecimals);
            if (isPrecisionEqual)
                return ethers_1.BigNumber.from(reservesA)
                    .mul("1000")
                    .div(reservesB)
                    .toString();
            if (isTokenAMorePrecise) {
                const decimalAdjustment = ethers_1.BigNumber.from("10").pow(ethers_1.BigNumber.from(tokenADecimals).sub(tokenBDecimals));
                const adjustedReservesB = decimalAdjustment.mul(reservesB);
                return ethers_1.BigNumber.from(reservesA)
                    .mul("1000")
                    .div(adjustedReservesB)
                    .toString();
            }
            const decimalAdjustment = ethers_1.BigNumber.from("10").pow(ethers_1.BigNumber.from(tokenBDecimals).sub(tokenADecimals));
            const adjustedReservesA = decimalAdjustment.mul(reservesA);
            return adjustedReservesA.mul("1000").div(reservesB).toString();
        });
    }
    getAddLiquidityCalldata() {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenA = yield this.getTokenA();
            let tokenAAmount;
            let minTokenAOut;
            const tokenB = yield this.getTokenB();
            let tokenBAmount;
            let minTokenBOut;
            let ohmDecimals;
            let otherDecimals;
            const reserveRatio = yield this.getReserveRatio();
            if (tokenA == addresses_1.OhmAddress) {
                tokenAAmount = this.ohmToBorrow;
                minTokenAOut = ethers_1.BigNumber.from(tokenAAmount)
                    .mul(this.acceptableSlippage)
                    .div("1000")
                    .toString();
                ohmDecimals = yield this.getTokenADecimals();
                otherDecimals = yield this.getTokenBDecimals();
                const decimalDiff = ethers_1.BigNumber.from(otherDecimals).sub(ohmDecimals);
                if (decimalDiff.gt("0")) {
                    tokenBAmount = ethers_1.BigNumber.from(tokenAAmount)
                        .mul("1000")
                        .mul(ethers_1.BigNumber.from("10").pow(decimalDiff))
                        .div(reserveRatio)
                        .toString();
                }
                else if (decimalDiff.lt("0")) {
                    tokenBAmount = ethers_1.BigNumber.from(tokenAAmount)
                        .mul("1000")
                        .div(reserveRatio)
                        .div(ethers_1.BigNumber.from("10").pow(decimalDiff.abs()))
                        .toString();
                }
                else {
                    tokenBAmount = ethers_1.BigNumber.from(tokenAAmount)
                        .mul("1000")
                        .div(reserveRatio)
                        .toString();
                }
                minTokenBOut = ethers_1.BigNumber.from(tokenBAmount)
                    .mul(this.acceptableSlippage)
                    .div("1000")
                    .toString();
            }
            else {
                tokenBAmount = this.ohmToBorrow;
                minTokenBOut = ethers_1.BigNumber.from(tokenBAmount)
                    .mul(this.acceptableSlippage)
                    .div("1000")
                    .toString();
                ohmDecimals = yield this.getTokenBDecimals();
                otherDecimals = yield this.getTokenBDecimals();
                const decimalDiff = ethers_1.BigNumber.from(otherDecimals).sub(ohmDecimals);
                if (decimalDiff.gt("0")) {
                    tokenAAmount = ethers_1.BigNumber.from(tokenBAmount)
                        .mul(reserveRatio)
                        .mul(ethers_1.BigNumber.from("10").pow(decimalDiff))
                        .div("1000")
                        .toString();
                }
                else if (decimalDiff.lt("0")) {
                    tokenAAmount = ethers_1.BigNumber.from(tokenBAmount)
                        .mul(reserveRatio)
                        .div(ethers_1.BigNumber.from("10").pow(decimalDiff.abs()))
                        .div("1000")
                        .toString();
                }
                else {
                    tokenAAmount = ethers_1.BigNumber.from(tokenBAmount)
                        .mul(reserveRatio)
                        .div("1000")
                        .toString();
                }
                minTokenAOut = ethers_1.BigNumber.from(tokenAAmount)
                    .mul(this.acceptableSlippage)
                    .div("1000")
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
