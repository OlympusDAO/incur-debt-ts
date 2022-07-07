import { BigNumber, Contract, providers } from "ethers";
import { defaultAbiCoder as abiCoder } from "ethers/lib/utils";
import { UniswapV2ABI } from "../metadata/abis";
import { OhmAddress } from "../metadata/addresses";

type JsonRpcProvider = providers.JsonRpcProvider;

export class Uniswap {
    static abi = UniswapV2ABI;

    private liquidityPool: Contract;

    private acceptableSlippage: number;

    private ohmToBorrow: string;

    constructor(
        lpAddress: string,
        slippage: number = 0.01,
        ohmAmount: string,
        provider: JsonRpcProvider
    ) {
        this.liquidityPool = new Contract(lpAddress, Uniswap.abi, provider);

        this.acceptableSlippage = 1 - slippage;

        this.ohmToBorrow = ohmAmount;
    }

    async getTokenA(): Promise<string> {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");
        return this.liquidityPool.token0();
    }

    async getTokenB(): Promise<string> {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");
        return this.liquidityPool.token1();
    }

    async getReserveRatio(): Promise<string> {
        if (!this.liquidityPool)
            throw new Error("Liquidity pool not initialized");

        const { reserves0, reserves1, lastTimestamp } =
            await this.liquidityPool.getReserves();
        const reserveRatio = BigNumber.from(reserves0).div(
            BigNumber.from(reserves1)
        );

        return reserveRatio.toString();
    }

    async getEncodedParams() {
        const tokenA = await this.getTokenA();
        let tokenAAmount: string;
        let minTokenAOut: string;

        const tokenB = await this.getTokenB();
        let tokenBAmount: string;
        let minTokenBOut: string;

        const reserveRatio = await this.getReserveRatio();

        if (tokenA == OhmAddress) {
            tokenAAmount = this.ohmToBorrow;
            minTokenAOut = BigNumber.from(tokenAAmount)
                .mul(this.acceptableSlippage)
                .toString();

            tokenBAmount = BigNumber.from(tokenAAmount)
                .div(reserveRatio)
                .toString();
            minTokenBOut = BigNumber.from(tokenBAmount)
                .mul(this.acceptableSlippage)
                .toString();
        } else {
            tokenBAmount = this.ohmToBorrow;
            minTokenBOut = BigNumber.from(tokenBAmount)
                .mul(this.acceptableSlippage)
                .toString();

            tokenAAmount = BigNumber.from(tokenBAmount)
                .mul(reserveRatio)
                .toString();
            minTokenAOut = BigNumber.from(tokenAAmount)
                .mul(this.acceptableSlippage)
                .toString();
        }

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
