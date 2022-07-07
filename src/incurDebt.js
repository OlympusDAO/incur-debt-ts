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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.IncurDebt = void 0;
var ethers_1 = require("ethers");
var abis_1 = require("./metadata/abis");
var addresses_1 = require("./metadata/addresses");
var Balancer_1 = require("./strategies/Balancer");
var Curve_1 = require("./strategies/Curve");
var Uniswap_1 = require("./strategies/Uniswap");
var IncurDebt = /** @class */ (function () {
    function IncurDebt(context) {
        this._context = context;
        this._strategies = addresses_1.StrategyAddresses;
        this.contract = new ethers_1.Contract(addresses_1.IncurDebtAddress, IncurDebt.abi, context.provider);
    }
    IncurDebt.prototype.encodeBorrowParameters = function (sender, strategy, lpAddress, slippage, ohmAmount, otherTokens, otherTokenAmounts) {
        if (slippage === void 0) { slippage = 0.01; }
        if (otherTokens === void 0) { otherTokens = []; }
        if (otherTokenAmounts === void 0) { otherTokenAmounts = []; }
        return __awaiter(this, void 0, void 0, function () {
            var provider, strategies, tx, strategyInstance, encodedParams;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = this._context.provider;
                        strategies = this._strategies;
                        strategy = strategy.toLowerCase();
                        if (!strategies[strategy])
                            throw new Error("The only available strategies are Curve, Uniswap, Sushiswap, or Balancer.");
                        if (strategy == "uniswap" || strategy == "sushiswap")
                            strategyInstance = new Uniswap_1.Uniswap(lpAddress, slippage, ohmAmount, provider);
                        else if (strategy == "balancer")
                            strategyInstance = new Balancer_1.Balancer(sender, lpAddress, otherTokens, otherTokenAmounts, slippage, ohmAmount, provider);
                        else
                            strategyInstance = new Curve_1.Curve(lpAddress, slippage, ohmAmount, provider);
                        encodedParams = strategyInstance.getEncodedParams();
                        return [4 /*yield*/, this.contract.populateTransaction.createLP(ohmAmount, strategies[strategy], encodedParams)];
                    case 1:
                        tx = _a.sent();
                        return [2 /*return*/, tx];
                }
            });
        });
    };
    IncurDebt.abi = abis_1.IncurDebtABI;
    return IncurDebt;
}());
exports.IncurDebt = IncurDebt;
