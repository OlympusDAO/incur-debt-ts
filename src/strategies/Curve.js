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
        this.liquidityPool = new ethers_1.Contract(lpAddress, Curve.abi, provider);
        this.acceptableSlippage = 1 - slippage;
        this.ohmToBorrow = ohmAmount;
    }
    getTokenA() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.liquidityPool)
                throw new Error("Liquidity pool not initialized");
            return this.liquidityPool.coins(0);
        });
    }
    getTokenB() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.liquidityPool)
                throw new Error("Liquidity pool not initialized");
            return this.liquidityPool.coins(1);
        });
    }
    getReserveRatio() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.liquidityPool)
                throw new Error("Liquidity pool not initialized");
            const reserves0 = yield this.liquidityPool.balances(0);
            const reserves1 = yield this.liquidityPool.balances(1);
            const reserveRatio = ethers_1.BigNumber.from(reserves0).div(ethers_1.BigNumber.from(reserves1));
            return reserveRatio.toString();
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
                    .div(reserveRatio)
                    .toString();
                otherToken = tokenB;
            }
            else {
                tokenBAmount = this.ohmToBorrow;
                tokenAAmount = ethers_1.BigNumber.from(tokenBAmount)
                    .mul(reserveRatio)
                    .toString();
                otherToken = tokenA;
            }
            const expectedLPTokenAmount = yield this.getLPTokenAmount([tokenAAmount, tokenBAmount], true);
            const encodedParams = utils_1.defaultAbiCoder.encode(["uint256[2]", "uint256", "address", "address"], [
                [tokenAAmount, tokenBAmount],
                expectedLPTokenAmount,
                otherToken,
                this.liquidityPool.address,
            ]);
            return encodedParams;
        });
    }
}
exports.Curve = Curve;
Curve.abi = abis_1.StableSwapABI;
