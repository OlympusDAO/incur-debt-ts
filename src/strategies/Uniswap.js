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
exports.Uniswap = void 0;
var ethers_1 = require("ethers");
var utils_1 = require("ethers/lib/utils");
var abis_1 = require("../metadata/abis");
var addresses_1 = require("../metadata/addresses");
var Uniswap = /** @class */ (function () {
    function Uniswap(lpAddress, slippage, ohmAmount, provider) {
        if (slippage === void 0) { slippage = 0.01; }
        this.provider = provider;
        this.liquidityPool = new ethers_1.Contract(lpAddress, Uniswap.abi, this.provider);
        this.acceptableSlippage = (1 - slippage) * 100;
        this.ohmToBorrow = ohmAmount;
    }
    Uniswap.prototype.getTokenA = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.liquidityPool)
                    throw new Error("Liquidity pool not initialized");
                return [2 /*return*/, this.liquidityPool.token0()];
            });
        });
    };
    Uniswap.prototype.getTokenADecimals = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAAddress, tokenAContract, tokenADecimals;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.liquidityPool)
                            throw new Error("Liquidity pool not initialized");
                        return [4 /*yield*/, this.getTokenA()];
                    case 1:
                        tokenAAddress = _a.sent();
                        tokenAContract = new ethers_1.Contract(tokenAAddress, abis_1.ERC20ABI, this.provider);
                        return [4 /*yield*/, tokenAContract.decimals()];
                    case 2:
                        tokenADecimals = _a.sent();
                        return [2 /*return*/, tokenADecimals];
                }
            });
        });
    };
    Uniswap.prototype.getTokenB = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.liquidityPool)
                    throw new Error("Liquidity pool not initialized");
                return [2 /*return*/, this.liquidityPool.token1()];
            });
        });
    };
    Uniswap.prototype.getTokenBDecimals = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tokenBAddress, tokenBContract, tokenBDecimals;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.liquidityPool)
                            throw new Error("Liquidity pool not initialized");
                        return [4 /*yield*/, this.getTokenB()];
                    case 1:
                        tokenBAddress = _a.sent();
                        tokenBContract = new ethers_1.Contract(tokenBAddress, abis_1.ERC20ABI, this.provider);
                        return [4 /*yield*/, tokenBContract.decimals()];
                    case 2:
                        tokenBDecimals = _a.sent();
                        return [2 /*return*/, tokenBDecimals];
                }
            });
        });
    };
    Uniswap.prototype.getReserveRatio = function () {
        return __awaiter(this, void 0, void 0, function () {
            var reservesInfo, reservesA, tokenADecimals, reservesB, tokenBDecimals, isPrecisionEqual, isTokenAMorePrecise, decimalAdjustment_1, adjustedReservesB, decimalAdjustment, adjustedReservesA;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.liquidityPool)
                            throw new Error("Liquidity pool not initialized");
                        return [4 /*yield*/, this.liquidityPool.getReserves()];
                    case 1:
                        reservesInfo = _a.sent();
                        reservesA = reservesInfo[0];
                        return [4 /*yield*/, this.getTokenADecimals()];
                    case 2:
                        tokenADecimals = _a.sent();
                        reservesB = reservesInfo[1];
                        return [4 /*yield*/, this.getTokenBDecimals()];
                    case 3:
                        tokenBDecimals = _a.sent();
                        isPrecisionEqual = ethers_1.BigNumber.from(tokenADecimals).eq(tokenBDecimals);
                        isTokenAMorePrecise = ethers_1.BigNumber.from(tokenADecimals).gt(tokenBDecimals);
                        if (isPrecisionEqual)
                            return [2 /*return*/, ethers_1.BigNumber.from(reservesA).div(reservesB).mul("100").toString()];
                        if (isTokenAMorePrecise) {
                            decimalAdjustment_1 = ethers_1.BigNumber.from(tokenADecimals).div(tokenBDecimals);
                            adjustedReservesB = decimalAdjustment_1.mul(reservesB);
                            return [2 /*return*/, ethers_1.BigNumber.from(reservesA).div(adjustedReservesB).mul("100").toString()];
                        }
                        decimalAdjustment = ethers_1.BigNumber.from(tokenBDecimals).div(tokenADecimals);
                        adjustedReservesA = decimalAdjustment.mul(reservesA);
                        return [2 /*return*/, adjustedReservesA.div(reservesB).mul("100").toString()];
                }
            });
        });
    };
    Uniswap.prototype.getEncodedParams = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tokenA, tokenAAmount, minTokenAOut, tokenB, tokenBAmount, minTokenBOut, reserveRatio, encodedParams;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTokenA()];
                    case 1:
                        tokenA = _a.sent();
                        return [4 /*yield*/, this.getTokenB()];
                    case 2:
                        tokenB = _a.sent();
                        return [4 /*yield*/, this.getReserveRatio()];
                    case 3:
                        reserveRatio = _a.sent();
                        if (tokenA == addresses_1.OhmAddress) {
                            tokenAAmount = this.ohmToBorrow;
                            minTokenAOut = ethers_1.BigNumber.from(tokenAAmount)
                                .mul(this.acceptableSlippage)
                                .div("100")
                                .toString();
                            tokenBAmount = ethers_1.BigNumber.from(tokenAAmount)
                                .mul("100")
                                .div(reserveRatio)
                                .toString();
                            minTokenBOut = ethers_1.BigNumber.from(tokenBAmount)
                                .mul(this.acceptableSlippage)
                                .div("100")
                                .toString();
                        }
                        else {
                            tokenBAmount = this.ohmToBorrow;
                            minTokenBOut = ethers_1.BigNumber.from(tokenBAmount)
                                .mul(this.acceptableSlippage)
                                .div("100")
                                .toString();
                            tokenAAmount = ethers_1.BigNumber.from(tokenBAmount)
                                .mul(reserveRatio)
                                .div("100")
                                .toString();
                            minTokenAOut = ethers_1.BigNumber.from(tokenAAmount)
                                .mul(this.acceptableSlippage)
                                .div("100")
                                .toString();
                        }
                        encodedParams = utils_1.defaultAbiCoder.encode(["address", "address", "uint256", "uint256", "uint256", "uint256"], [
                            tokenA,
                            tokenB,
                            tokenAAmount,
                            tokenBAmount,
                            minTokenAOut,
                            minTokenBOut,
                        ]);
                        return [2 /*return*/, encodedParams];
                }
            });
        });
    };
    Uniswap.abi = abis_1.UniswapV2ABI;
    return Uniswap;
}());
exports.Uniswap = Uniswap;
