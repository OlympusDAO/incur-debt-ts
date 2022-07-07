import { StrategyInterface } from "../interfaces/strategy";
import { BigNumber, Contract, providers } from "ethers";
import { defaultAbiCoder as abiCoder } from "ethers/lib/utils";
import { StableSwapABI } from "../metadata/abis";
import { OhmAddress } from "../metadata/addresses";

type JsonRpcProvider = providers.JsonRpcProvider;

export class Curve implements StrategyInterface {
    static abi = StableSwapABI;

    private liquidityPool: Contract;

    private acceptableSlippage: number;

    private ohmToBorrow: string;

    constructor(
        lpAddress: string,
        slippage: number = 0.01,
        ohmAmount: string,
        provider: JsonRpcProvider
    ) {
        this.liquidityPool = new Contract(lpAddress, Curve.abi, provider);

        this.acceptableSlippage = 1 - slippage;

        this.ohmToBorrow = ohmAmount;
    }

    async getTokenA(): Promise<string> {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");
        return this.liquidityPool.coins(0);
    }

    async getTokenB(): Promise<string> {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");
        return this.liquidityPool.coins(1);
    }

    async getReserveRatio(): Promise<string> {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");

        const reserves0 = await this.liquidityPool.balances(0);
        const reserves1 = await this.liquidityPool.balances(1);

        const reserveRatio = BigNumber.from(reserves0).div(
            BigNumber.from(reserves1)
        );

        return reserveRatio.toString();
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

    async getEncodedParams(): Promise<string> {
        const tokenA = await this.getTokenA();
        let tokenAAmount: string;

        const tokenB = await this.getTokenB();
        let tokenBAmount: string;

        let otherToken: string;

        const reserveRatio = await this.getReserveRatio();

        if (tokenA == OhmAddress) {
            tokenAAmount = this.ohmToBorrow;
            tokenBAmount = BigNumber.from(tokenAAmount)
                .div(reserveRatio)
                .toString();
            otherToken = tokenB;
        } else {
            tokenBAmount = this.ohmToBorrow;
            tokenAAmount = BigNumber.from(tokenBAmount)
                .mul(reserveRatio)
                .toString();
            otherToken = tokenA;
        }

        const expectedLPTokenAmount = await this.getLPTokenAmount(
            [tokenAAmount, tokenBAmount],
            true
        );

        const encodedParams = abiCoder.encode(
            ["uint256[2]", "uint256", "address", "address"],
            [
                [tokenAAmount, tokenBAmount],
                expectedLPTokenAmount,
                otherToken,
                this.liquidityPool.address,
            ]
        );
        return encodedParams;
    }
}
