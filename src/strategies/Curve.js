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
exports.Curve = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const abis_1 = require("../metadata/abis");
const addresses_1 = require("../metadata/addresses");
class Curve {
    constructor(lpAddress, slippage = 0.01, ohmAmount, provider) {
        this.provider = provider;
        this.liquidityPool = new ethers_1.Contract(lpAddress, Curve.abi, this.provider);
        this.acceptableSlippage = (1 - slippage) * 1000;
        this.ohmToBorrow = ohmAmount;
    }
    getTokenA() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.liquidityPool)
                throw new Error("Liquidity pool not initialized");
            return this.liquidityPool.coins(0);
        });
    }
    getTokenADecimals() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.liquidityPool)
                throw new Error("Liquidity pool not initialized");
            const tokenAAddress = yield this.liquidityPool.coins(0);
            const tokenAContract = new ethers_1.Contract(tokenAAddress, abis_1.ERC20ABI, this.provider);
            const tokenADecimals = yield tokenAContract.decimals();
            return tokenADecimals;
        });
    }
    getTokenB() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.liquidityPool)
                throw new Error("Liquidity pool not initialized");
            return this.liquidityPool.coins(1);
        });
    }
    getTokenBDecimals() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.liquidityPool)
                throw new Error("Liquidity pool not initialized");
            const tokenBAddress = yield this.liquidityPool.coins(1);
            const tokenBContract = new ethers_1.Contract(tokenBAddress, abis_1.ERC20ABI, this.provider);
            const tokenBDecimals = yield tokenBContract.decimals();
            return tokenBDecimals;
        });
    }
    getReserveRatio() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.liquidityPool)
                throw new Error("Liquidity pool not initialized");
            const reservesA = yield this.liquidityPool.balances(0);
            const tokenADecimals = yield this.getTokenADecimals();
            const reservesB = yield this.liquidityPool.balances(1);
            const tokenBDecimals = yield this.getTokenBDecimals();
            const isPrecisionEqual = ethers_1.BigNumber.from(tokenADecimals).eq(tokenBDecimals);
            const isTokenAMorePrecise = ethers_1.BigNumber.from(tokenADecimals).gt(tokenBDecimals);
            if (isPrecisionEqual)
                return ethers_1.BigNumber.from(reservesA)
                    .mul("1000")
                    .div(reservesB)
                    .toString();
            if (isTokenAMorePrecise) {
                const decimalAdjustment = ethers_1.BigNumber.from(tokenADecimals).div(tokenBDecimals);
                const adjustedReservesB = decimalAdjustment.mul(reservesB);
                return ethers_1.BigNumber.from(reservesA)
                    .mul("1000")
                    .div(adjustedReservesB)
                    .toString();
            }
            const decimalAdjustment = ethers_1.BigNumber.from(tokenBDecimals).div(tokenADecimals);
            const adjustedReservesA = decimalAdjustment.mul(reservesA);
            return adjustedReservesA.mul("1000").div(reservesB).toString();
        });
    }
    getLPTokenAmount(amounts, isDeposit = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (amounts.length > 2)
                throw new Error("Right now we only support two token Curve pools");
            const expectedLPTokenAmount = yield this.liquidityPool.calc_token_amount(amounts, isDeposit);
            return expectedLPTokenAmount;
        });
    }
    getEncodedParams() {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenA = yield this.getTokenA();
            let tokenAAmount;
            const tokenB = yield this.getTokenB();
            let tokenBAmount;
            let otherToken;
            const reserveRatio = yield this.getReserveRatio();
            if (tokenA == addresses_1.OhmAddress) {
                tokenAAmount = this.ohmToBorrow;
                tokenBAmount = ethers_1.BigNumber.from(tokenAAmount)
                    .mul("1000")
                    .div(reserveRatio)
                    .toString();
                otherToken = tokenB;
            }
            else {
                tokenBAmount = this.ohmToBorrow;
                tokenAAmount = ethers_1.BigNumber.from(tokenBAmount)
                    .mul(reserveRatio)
                    .div("1000")
                    .toString();
                otherToken = tokenA;
            }
            const expectedLPTokenAmount = yield this.getLPTokenAmount([tokenAAmount, tokenBAmount], true);
            const minLPTokenAmount = ethers_1.BigNumber.from(expectedLPTokenAmount)
                .mul(this.acceptableSlippage)
                .div("1000")
                .toString();
            const encodedParams = utils_1.defaultAbiCoder.encode(["uint256[2]", "uint256", "address", "address"], [
                [tokenAAmount, tokenBAmount],
                minLPTokenAmount,
                otherToken,
                this.liquidityPool.address,
            ]);
            return encodedParams;
        });
    }
}
exports.Curve = Curve;
Curve.abi = abis_1.StableSwapABI;
