"use strict";
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
    async getTokenA() {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");
        return this.liquidityPool.token0();
    }
    async getTokenADecimals() {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");
        const tokenAAddress = await this.getTokenA();
        const tokenAContract = new ethers_1.Contract(tokenAAddress, abis_1.ERC20ABI, this.provider);
        const tokenADecimals = await tokenAContract.decimals();
        return tokenADecimals;
    }
    async getTokenB() {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");
        return this.liquidityPool.token1();
    }
    async getTokenBDecimals() {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");
        const tokenBAddress = await this.getTokenB();
        const tokenBContract = new ethers_1.Contract(tokenBAddress, abis_1.ERC20ABI, this.provider);
        const tokenBDecimals = await tokenBContract.decimals();
        return tokenBDecimals;
    }
    async getReserveRatio() {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");
        const reservesInfo = await this.liquidityPool.getReserves();
        const reservesA = reservesInfo[0];
        const tokenADecimals = await this.getTokenADecimals();
        const reservesB = reservesInfo[1];
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
    async getAddLiquidityCalldata() {
        const tokenA = await this.getTokenA();
        let tokenAAmount;
        let minTokenAOut;
        const tokenB = await this.getTokenB();
        let tokenBAmount;
        let minTokenBOut;
        let ohmDecimals;
        let otherDecimals;
        const reserveRatio = await this.getReserveRatio();
        if (tokenA.toLowerCase() == addresses_1.OhmAddress.toLowerCase()) {
            console.log("1");
            tokenAAmount = this.ohmToBorrow;
            minTokenAOut = ethers_1.BigNumber.from(tokenAAmount)
                .mul(this.acceptableSlippage)
                .div("1000")
                .toString();
            ohmDecimals = await this.getTokenADecimals();
            otherDecimals = await this.getTokenBDecimals();
            const decimalDiff = ethers_1.BigNumber.from(otherDecimals).sub(ohmDecimals);
            console.log(tokenAAmount);
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
            console.log("2");
            tokenBAmount = this.ohmToBorrow;
            minTokenBOut = ethers_1.BigNumber.from(tokenBAmount)
                .mul(this.acceptableSlippage)
                .div("1000")
                .toString();
            ohmDecimals = await this.getTokenBDecimals();
            otherDecimals = await this.getTokenBDecimals();
            const decimalDiff = ethers_1.BigNumber.from(otherDecimals).sub(ohmDecimals);
            console.log(tokenBAmount);
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
        console.log(tokenA);
        console.log(tokenB);
        console.log(tokenAAmount);
        console.log(tokenBAmount);
        const encodedParams = utils_1.defaultAbiCoder.encode(["address", "address", "uint256", "uint256", "uint256", "uint256"], [
            tokenA,
            tokenB,
            tokenAAmount,
            tokenBAmount,
            minTokenAOut,
            minTokenBOut,
        ]);
        return encodedParams;
    }
}
exports.Uniswap = Uniswap;
Uniswap.abi = abis_1.UniswapV2ABI;
