import { BorrowerData, StrategyInterface } from "./types";
import { BigNumber, Contract, providers, UnsignedTransaction } from "ethers";
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
        this._strategies = StrategyAddresses(context.chainId)!;
        this.contract = new Contract(
            IncurDebtAddress(context.chainId)!,
            IncurDebt.abi,
            context.provider
        );
    }

    async getDepositTx(gohmAmount: string): Promise<UnsignedTransaction> {
        return await this.contract.populateTransaction.deposit(
            BigNumber.from(gohmAmount)
        );
    }

    async getBorrowTx(ohmAmount: string): Promise<UnsignedTransaction> {
        return await this.contract.populateTransaction.borrow(
            BigNumber.from(ohmAmount)
        );
    }

    async getAddLiquidityTx(
        sender: string,
        strategy: string,
        lpAddress: string,
        slippage: number = 0.01,
        ohmAmount: string,
        otherTokens: string[] = [],
        otherTokenAmounts: string[] = []
    ): Promise<UnsignedTransaction> {
        const provider: JsonRpcProvider = this._context.provider;
        const strategies: { [key: string]: string } = this._strategies;

        let tx: any;

        strategy = strategy.toLowerCase();

        if (!strategies[strategy])
            throw new Error(
                "The only available strategies are Curve, Uniswap, Sushiswap, or Balancer."
            );

        let strategyInstance: StrategyInterface;

        if (strategy == "uniswap" || strategy == "sushiswap")
            strategyInstance = new Uniswap(
                lpAddress,
                slippage,
                ohmAmount,
                provider,
                this._context.chainId
            );
        else if (strategy == "balancer")
            strategyInstance = new Balancer(
                sender,
                lpAddress,
                otherTokens,
                otherTokenAmounts,
                slippage,
                ohmAmount,
                provider,
                this._context.chainId
            );
        else
            strategyInstance = new Curve(
                lpAddress,
                slippage,
                ohmAmount,
                provider,
                this._context.chainId
            );

        const encodedParams = await strategyInstance.getAddLiquidityCalldata();

        tx = await this.contract.populateTransaction.createLP(
            ohmAmount,
            strategies[strategy],
            encodedParams
        );

        return tx;
    }

    async getWithdrawLiquidityTx(
        liquidity: string,
        lpToken: string
    ): Promise<UnsignedTransaction> {
        return await this.contract.populateTransaction.withdrawLP(
            BigNumber.from(liquidity),
            lpToken
        );
    }

    async getWithdrawTx(gohmAmount: string): Promise<UnsignedTransaction> {
        return await this.contract.populateTransaction.withdraw(
            BigNumber.from(gohmAmount)
        );
    }

    async getRepayDebtTx(
        gohmAmount: string,
        withCollateral: boolean,
        withdrawRest: boolean
    ): Promise<UnsignedTransaction> {
        const populator = this.contract.populateTransaction;
        if (withCollateral)
            if (withdrawRest)
                return await populator.repayDebtWithCollateralAndWithdrawTheRest();
            else return await populator.repayDebtWithCollateral();

        return await populator.repayDebtWithOHM(BigNumber.from(gohmAmount));
    }

    async getBorrowerData(borrower: string): Promise<BorrowerData> {
        const result: Array<any> = await this.contract.borrowers(borrower);
        return {
            debt: result[0],
            limit: result[1],
            collateralInGOHM: result[2],
            unwrappedGOHM: result[3],
            isNonLpBorrower: result[4],
            isLpBorrower: result[5],
        };
    }

    async balanceOfLpToken(
        accountAddress: string,
        lpAddress: string
    ): Promise<number> {
        return await this.contract.lpTokenOwnership(lpAddress, accountAddress);
    }

    async getBorrowable(): Promise<number> {
        return await this.contract.getAvailableToBorrow();
    }

    async getTotalOutstandingDebt(): Promise<number> {
        return await this.contract.totalOutstandingGlobalDebt();
    }
}
