"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Curve = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const abis_1 = require("../metadata/abis");
const addresses_1 = require("../metadata/addresses");
class Curve {
    constructor(lpAddress, slippage = 0.01, ohmAmount, provider, chainId) {
        this.provider = provider;
        this.liquidityPool = new ethers_1.Contract(lpAddress, Curve.abi, this.provider);
        this.acceptableSlippage = (1 - slippage) * 1000;
        this.ohmToBorrow = ohmAmount;
        this.ohmAddress = (0, addresses_1.OhmAddress)(chainId);
    }
    async getTokenA() {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");
        return this.liquidityPool.coins(0);
    }
    async getTokenADecimals() {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");
        const tokenAAddress = await this.liquidityPool.coins(0);
        const tokenAContract = new ethers_1.Contract(tokenAAddress, abis_1.ERC20ABI, this.provider);
        const tokenADecimals = await tokenAContract.decimals();
        return tokenADecimals;
    }
    async getTokenB() {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");
        return this.liquidityPool.coins(1);
    }
    async getTokenBDecimals() {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");
        const tokenBAddress = await this.liquidityPool.coins(1);
        const tokenBContract = new ethers_1.Contract(tokenBAddress, abis_1.ERC20ABI, this.provider);
        const tokenBDecimals = await tokenBContract.decimals();
        return tokenBDecimals;
    }
    async getReserveRatio() {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");
        const reservesA = await this.liquidityPool.balances(0);
        const tokenADecimals = await this.getTokenADecimals();
        const reservesB = await this.liquidityPool.balances(1);
        const tokenBDecimals = await this.getTokenBDecimals();
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
    }
    async getLPTokenAmount(amounts, isDeposit = true) {
        if (amounts.length > 2)
            throw new Error("Right now we only support two token Curve pools");
        const expectedLPTokenAmount = await this.liquidityPool.calc_token_amount(amounts, isDeposit);
        return expectedLPTokenAmount;
    }
    async getAddLiquidityCalldata() {
        const tokenA = await this.getTokenA();
        let tokenAAmount;
        const tokenB = await this.getTokenB();
        let tokenBAmount;
        let otherToken;
        let ohmDecimals;
        let otherDecimals;
        const reserveRatio = await this.getReserveRatio();
        if (tokenA.toLowerCase() == this.ohmAddress.toLowerCase()) {
            tokenAAmount = this.ohmToBorrow;
            ohmDecimals = await this.getTokenADecimals();
            otherToken = tokenB;
            otherDecimals = await this.getTokenBDecimals();
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
        }
        else {
            tokenBAmount = this.ohmToBorrow;
            ohmDecimals = await this.getTokenBDecimals();
            otherToken = tokenB;
            otherDecimals = await this.getTokenADecimals();
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
        }
        const expectedLPTokenAmount = await this.getLPTokenAmount([tokenAAmount, tokenBAmount], true);
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
    }
}
exports.Curve = Curve;
Curve.abi = abis_1.StableSwapABI;
