"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncurDebt = void 0;
const ethers_1 = require("ethers");
const abis_1 = require("./metadata/abis");
const addresses_1 = require("./metadata/addresses");
const Balancer_1 = require("./strategies/Balancer");
const Curve_1 = require("./strategies/Curve");
const Uniswap_1 = require("./strategies/Uniswap");
class IncurDebt {
    constructor(context) {
        this._context = context;
        this._strategies = addresses_1.StrategyAddresses;
        this.contract = new ethers_1.Contract((0, addresses_1.IncurDebtAddress)(context.chainId), IncurDebt.abi, context.provider);
    }
    async getAddLiquidityTx(sender, strategy, lpAddress, slippage = 0.01, ohmAmount, otherTokens = [], otherTokenAmounts = []) {
        const provider = this._context.provider;
        const strategies = this._strategies;
        let tx;
        strategy = strategy.toLowerCase();
        if (!strategies[strategy])
            throw new Error("The only available strategies are Curve, Uniswap, Sushiswap, or Balancer.");
        let strategyInstance;
        if (strategy == "uniswap" || strategy == "sushiswap")
            strategyInstance = new Uniswap_1.Uniswap(lpAddress, slippage, ohmAmount, provider);
        else if (strategy == "balancer")
            strategyInstance = new Balancer_1.Balancer(sender, lpAddress, otherTokens, otherTokenAmounts, slippage, ohmAmount, provider);
        else
            strategyInstance = new Curve_1.Curve(lpAddress, slippage, ohmAmount, provider);
        const encodedParams = await strategyInstance.getAddLiquidityCalldata();
        tx = await this.contract.populateTransaction.createLP(ohmAmount, strategies[strategy], encodedParams);
        return tx;
    }
    async getBorrowerData(borrower) {
        const result = await this.contract.borrowers(borrower);
        return {
            debt: result[0],
            limit: result[1],
            collateralInGOHM: result[2],
            unwrappedGOHM: result[3],
            isNonLpBorrower: result[4],
            isLpBorrower: result[5],
        };
    }
    async balanceOfLpToken(accountAddress, lpAddress) {
        return await this.contract.lpTokenOwnership(lpAddress, accountAddress);
    }
    async getBorrowable() {
        return await this.contract.getAvailableToBorrow();
    }
    async getTotalOutstandingDebt() {
        return await this.contract.totalOutstandingGlobalDebt();
    }
}
exports.IncurDebt = IncurDebt;
IncurDebt.abi = abis_1.IncurDebtABI;
