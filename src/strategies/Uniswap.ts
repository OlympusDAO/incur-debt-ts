import { BigNumber, Contract, ethers, providers } from "ethers";
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

        this.acceptableSlippage = (1 - slippage) * 100;

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

        const reservesInfo = await this.liquidityPool.getReserves();

        const reserveRatio = (
            BigNumber.from(reservesInfo[0]).div(BigNumber.from(reservesInfo[1])
        ).mul("100")
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
                .div("100")
                .toString();

            tokenBAmount = BigNumber.from(tokenAAmount)
                .mul("100")
                .div(reserveRatio)
                .toString();
            minTokenBOut = BigNumber.from(tokenBAmount)
                .mul(this.acceptableSlippage)
                .div("100")
                .toString();
        } else {
            tokenBAmount = this.ohmToBorrow;
            minTokenBOut = BigNumber.from(tokenBAmount)
                .mul(this.acceptableSlippage)
                .div("100")
                .toString();

            tokenAAmount = BigNumber.from(tokenBAmount)
                .mul(reserveRatio)
                .div("100")
                .toString();
            minTokenAOut = BigNumber.from(tokenAAmount)
                .mul(this.acceptableSlippage)
                .div("100")
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
