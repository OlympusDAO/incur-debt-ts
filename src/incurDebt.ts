import { Contract, providers } from "ethers";
import { IncurDebtABI } from "./metadata/abis";
import { IncurDebtAddress, StrategyAddresses } from "./metadata/addresses";
import { Context } from "./context";
import { Balancer } from "./strategies/Balancer";
import { Curve } from "./strategies/Curve";
import { Uniswap } from "./strategies/Uniswap";

type JsonRpcProvider = providers.JsonRpcProvider;

export class IncurDebt {
    static abi = IncurDebtABI;

    private _strategies: { [key: string]: string };

    private _context: Context;

    public contract: Contract;

    constructor(context: Context) {
        this._context = context;
        this._strategies = StrategyAddresses;
        this.contract = new Contract(
            IncurDebtAddress,
            IncurDebt.abi,
            context.provider
        );
    }

    async encodeBorrowParameters(
        sender: string,
        strategy: string,
        lpAddress: string,
        slippage: number = 0.01,
        ohmAmount: string,
        otherTokens: string[] = [],
        otherTokenAmounts: string[] = []
    ) {
        const provider: JsonRpcProvider = this._context.provider;
        const strategies: { [key: string]: string } = this._strategies;

        if (!strategies[strategy])
            throw new Error(
                "The only available strategies are Curve, Uniswap, Sushiswap, or Balancer."
            );

        if (strategy == "uniswap" || strategy == "sushiswap") {
            const UniStrategy = new Uniswap(
                lpAddress,
                slippage,
                ohmAmount,
                provider
            );
            const encodedParams = UniStrategy.getEncodedParams();
            const tx = await this.contract.populateTransaction.createLP(
                ohmAmount,
                strategies[strategy],
                encodedParams
            );
            return tx.data;
        }

        if (strategy == "balancer") {
            const BalancerStrategy = new Balancer(
                sender,
                lpAddress,
                otherTokens,
                otherTokenAmounts,
                slippage,
                ohmAmount,
                provider
            );

            const encodedParams = BalancerStrategy.getEncodedParams();
            const tx = await this.contract.populateTransaction.createLP(
                ohmAmount,
                strategies[strategy],
                encodedParams
            );
            return tx.data;
        }

        if (strategy == "curve") {
            const CurveStrategy = new Curve(
                lpAddress,
                slippage,
                ohmAmount,
                provider
            );

            const encodedParams = CurveStrategy.getEncodedParams();

            const tx = await this.contract.callStatic.createLP(
                ohmAmount,
                strategies[strategy],
                encodedParams
            );

            return tx.data;
        }
    }
}
