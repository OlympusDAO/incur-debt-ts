import { StrategyInterface } from "../types";
import { BigNumber, Contract, providers } from "ethers";
import { defaultAbiCoder as abiCoder } from "ethers/lib/utils";
import { ERC20ABI, UniswapV2ABI } from "../metadata/abis";
import { OhmAddress } from "../metadata/addresses";

type JsonRpcProvider = providers.JsonRpcProvider;

export class Uniswap implements StrategyInterface {
    static abi = UniswapV2ABI;

    private liquidityPool: Contract;

    private acceptableSlippage: number;

    private ohmToBorrow: string;

    private provider: JsonRpcProvider;

    constructor(
        lpAddress: string,
        slippage: number = 0.01,
        ohmAmount: string,
        provider: JsonRpcProvider
    ) {
        this.provider = provider;

        this.liquidityPool = new Contract(
            lpAddress,
            Uniswap.abi,
            this.provider
        );

        this.acceptableSlippage = (1 - slippage) * 1000;

        this.ohmToBorrow = ohmAmount;
    }

    async getTokenA(): Promise<string> {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");
        return this.liquidityPool.token0();
    }

    async getTokenADecimals(): Promise<string> {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");

        const tokenAAddress = await this.getTokenA();
        const tokenAContract = new Contract(
            tokenAAddress,
            ERC20ABI,
            this.provider
        );
        const tokenADecimals = await tokenAContract.decimals();

        return tokenADecimals;
    }

    async getTokenB(): Promise<string> {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");
        return this.liquidityPool.token1();
    }

    async getTokenBDecimals(): Promise<string> {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");

        const tokenBAddress = await this.getTokenB();
        const tokenBContract = new Contract(
            tokenBAddress,
            ERC20ABI,
            this.provider
        );
        const tokenBDecimals = await tokenBContract.decimals();

        return tokenBDecimals;
    }

    async getReserveRatio(): Promise<string> {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");

        const reservesInfo = await this.liquidityPool.getReserves();

        const reservesA = reservesInfo[0];
        const tokenADecimals = await this.getTokenADecimals();

        const reservesB = reservesInfo[1];
        const tokenBDecimals = await this.getTokenBDecimals();

        const isPrecisionEqual =
            BigNumber.from(tokenADecimals).eq(tokenBDecimals);
        const isTokenAMorePrecise =
            BigNumber.from(tokenADecimals).gt(tokenBDecimals);

        if (isPrecisionEqual)
            return BigNumber.from(reservesA)
                .mul("1000")
                .div(reservesB)
                .toString();

        if (isTokenAMorePrecise) {
            const decimalAdjustment = BigNumber.from("10").pow(
                BigNumber.from(tokenADecimals).sub(tokenBDecimals)
            );
            const adjustedReservesB = decimalAdjustment.mul(reservesB);
            return BigNumber.from(reservesA)
                .mul("1000")
                .div(adjustedReservesB)
                .toString();
        }

        const decimalAdjustment = BigNumber.from("10").pow(
            BigNumber.from(tokenBDecimals).sub(tokenADecimals)
        );
        const adjustedReservesA = decimalAdjustment.mul(reservesA);
        return adjustedReservesA.mul("1000").div(reservesB).toString();
    }

    async getAddLiquidityCalldata(): Promise<string> {
        const tokenA = await this.getTokenA();
        let tokenAAmount: string;
        let minTokenAOut: string;

        const tokenB = await this.getTokenB();
        let tokenBAmount: string;
        let minTokenBOut: string;

        let ohmDecimals: string;
        let otherDecimals: string;

        const reserveRatio = await this.getReserveRatio();

        if (tokenA.toLowerCase() == OhmAddress.toLowerCase()) {
            console.log("1");
            tokenAAmount = this.ohmToBorrow;
            minTokenAOut = BigNumber.from(tokenAAmount)
                .mul(this.acceptableSlippage)
                .div("1000")
                .toString();
            ohmDecimals = await this.getTokenADecimals();
            otherDecimals = await this.getTokenBDecimals();
            const decimalDiff = BigNumber.from(otherDecimals).sub(ohmDecimals);
            console.log(tokenAAmount);

            if (decimalDiff.gt("0")) {
                tokenBAmount = BigNumber.from(tokenAAmount)
                    .mul("1000")
                    .mul(BigNumber.from("10").pow(decimalDiff))
                    .div(reserveRatio)
                    .toString();
            } else if (decimalDiff.lt("0")) {
                tokenBAmount = BigNumber.from(tokenAAmount)
                    .mul("1000")
                    .div(reserveRatio)
                    .div(BigNumber.from("10").pow(decimalDiff.abs()))
                    .toString();
            } else {
                tokenBAmount = BigNumber.from(tokenAAmount)
                    .mul("1000")
                    .div(reserveRatio)
                    .toString();
            }

            minTokenBOut = BigNumber.from(tokenBAmount)
                .mul(this.acceptableSlippage)
                .div("1000")
                .toString();
        } else {
            console.log("2");
            tokenBAmount = this.ohmToBorrow;
            minTokenBOut = BigNumber.from(tokenBAmount)
                .mul(this.acceptableSlippage)
                .div("1000")
                .toString();
            ohmDecimals = await this.getTokenBDecimals();
            otherDecimals = await this.getTokenBDecimals();
            const decimalDiff = BigNumber.from(otherDecimals).sub(ohmDecimals);
            console.log(tokenBAmount);

            if (decimalDiff.gt("0")) {
                tokenAAmount = BigNumber.from(tokenBAmount)
                    .mul(reserveRatio)
                    .mul(BigNumber.from("10").pow(decimalDiff))
                    .div("1000")
                    .toString();
            } else if (decimalDiff.lt("0")) {
                tokenAAmount = BigNumber.from(tokenBAmount)
                    .mul(reserveRatio)
                    .div(BigNumber.from("10").pow(decimalDiff.abs()))
                    .div("1000")
                    .toString();
            } else {
                tokenAAmount = BigNumber.from(tokenBAmount)
                    .mul(reserveRatio)
                    .div("1000")
                    .toString();
            }

            minTokenAOut = BigNumber.from(tokenAAmount)
                .mul(this.acceptableSlippage)
                .div("1000")
                .toString();
        }

        console.log(tokenA);
        console.log(tokenB);
        console.log(tokenAAmount);
        console.log(tokenBAmount);
        const encodedParams = abiCoder.encode(
            ["address", "address", "uint256", "uint256", "uint256", "uint256"],
            [
                tokenA,
                tokenB,
                tokenAAmount,
                tokenBAmount,
                minTokenAOut,
                minTokenBOut,
            ]
        );
        return encodedParams;
    }
}
