"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncurDebt = void 0;
const ethers_1 = require("ethers");
const abis_1 = require("./metadata/abis");
const addresses_1 = require("./metadata/addresses");
const Balancer_1 = require("./strategies/Balancer");
const Curve_1 = require("./strategies/Curve");
const Uniswap_1 = require("./strategies/Uniswap");
const utils_1 = require("ethers/lib/utils");
class IncurDebt {
    constructor(context) {
        this._context = context;
        this._strategies = addresses_1.StrategyAddresses;
        this.contract = new ethers_1.Contract(addresses_1.IncurDebtAddress, IncurDebt.abi, context.provider);
    }
    encodeBorrowParameters(sender, strategy, lpAddress, slippage = 0.01, ohmAmount, otherTokens = [], otherTokenAmounts = []) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const encodedParams = yield strategyInstance.getEncodedParams();
            const decodedParams = utils_1.defaultAbiCoder.decode(["address", "address", "uint256", "uint256", "uint256", "uint256"], encodedParams);
            tx = yield this.contract.populateTransaction.createLP(ohmAmount, strategies[strategy], encodedParams);
            return tx;
        });
    }
}
exports.IncurDebt = IncurDebt;
IncurDebt.abi = abis_1.IncurDebtABI;
