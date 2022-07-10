import { StrategyInterface } from "../types";
import { BigNumber, Contract, providers } from "ethers";
import { defaultAbiCoder as abiCoder } from "ethers/lib/utils";
import { ERC20ABI, StableSwapABI } from "../metadata/abis";
import { OhmAddress } from "../metadata/addresses";

type JsonRpcProvider = providers.JsonRpcProvider;

export class Curve implements StrategyInterface {
    static abi = StableSwapABI;

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

        this.liquidityPool = new Contract(lpAddress, Curve.abi, this.provider);

        this.acceptableSlippage = (1 - slippage) * 1000;

        this.ohmToBorrow = ohmAmount;
    }

    async getTokenA(): Promise<string> {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");
        return this.liquidityPool.coins(0);
    }

    async getTokenADecimals(): Promise<string> {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");
        const tokenAAddress = await this.liquidityPool.coins(0);
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
        return this.liquidityPool.coins(1);
    }

    async getTokenBDecimals(): Promise<string> {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");
        const tokenBAddress = await this.liquidityPool.coins(1);
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

        const reservesA = await this.liquidityPool.balances(0);
        const tokenADecimals = await this.getTokenADecimals();

        const reservesB = await this.liquidityPool.balances(1);
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
            const decimalAdjustment =
                BigNumber.from(tokenADecimals).div(tokenBDecimals);
            const adjustedReservesB = decimalAdjustment.mul(reservesB);
            return BigNumber.from(reservesA)
                .mul("1000")
                .div(adjustedReservesB)
                .toString();
        }

        const decimalAdjustment =
            BigNumber.from(tokenBDecimals).div(tokenADecimals);
        const adjustedReservesA = decimalAdjustment.mul(reservesA);
        return adjustedReservesA.mul("1000").div(reservesB).toString();
    }

    async getLPTokenAmount(
        amounts: string[],
        isDeposit: boolean = true
    ): Promise<string> {
        if (amounts.length > 2)
            throw new Error("Right now we only support two token Curve pools");

        const expectedLPTokenAmount =
            await this.liquidityPool.calc_token_amount(amounts, isDeposit);
        return expectedLPTokenAmount;
    }

    async getAddLiquidityCalldata(): Promise<string> {
        const tokenA = await this.getTokenA();
        let tokenAAmount: string;

        const tokenB = await this.getTokenB();
        let tokenBAmount: string;

        let otherToken: string;

        const reserveRatio = await this.getReserveRatio();

        if (tokenA.toLowerCase() == OhmAddress.toLowerCase()) {
            tokenAAmount = this.ohmToBorrow;
            tokenBAmount = BigNumber.from(tokenAAmount)
                .mul("1000")
                .div(reserveRatio)
                .toString();
            otherToken = tokenB;
        } else {
            tokenBAmount = this.ohmToBorrow;
            tokenAAmount = BigNumber.from(tokenBAmount)
                .mul(reserveRatio)
                .div("1000")
                .toString();
            otherToken = tokenA;
        }

        const expectedLPTokenAmount = await this.getLPTokenAmount(
            [tokenAAmount, tokenBAmount],
            true
        );
        const minLPTokenAmount = BigNumber.from(expectedLPTokenAmount)
            .mul(this.acceptableSlippage)
            .div("1000")
            .toString();

        const encodedParams = abiCoder.encode(
            ["uint256[2]", "uint256", "address", "address"],
            [
                [tokenAAmount, tokenBAmount],
                minLPTokenAmount,
                otherToken,
                this.liquidityPool.address,
            ]
        );
        return encodedParams;
    }
}
