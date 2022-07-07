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
exports.Curve = void 0;
var ethers_1 = require("ethers");
var utils_1 = require("ethers/lib/utils");
var abis_1 = require("../metadata/abis");
var addresses_1 = require("../metadata/addresses");
var Curve = /** @class */ (function () {
    function Curve(lpAddress, slippage, ohmAmount, provider) {
        if (slippage === void 0) { slippage = 0.01; }
        this.liquidityPool = new ethers_1.Contract(lpAddress, Curve.abi, provider);
        this.acceptableSlippage = 1 - slippage;
        this.ohmToBorrow = ohmAmount;
    }
    Curve.prototype.getTokenA = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.liquidityPool)
                    throw new Error("Liquidity pool not initialized");
                return [2 /*return*/, this.liquidityPool.coins(0)];
            });
        });
    };
    Curve.prototype.getTokenB = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.liquidityPool)
                    throw new Error("Liquidity pool not initialized");
                return [2 /*return*/, this.liquidityPool.coins(1)];
            });
        });
    };
    Curve.prototype.getReserveRatio = function () {
        return __awaiter(this, void 0, void 0, function () {
            var reserves0, reserves1, reserveRatio;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.liquidityPool)
                            throw new Error("Liquidity pool not initialized");
                        return [4 /*yield*/, this.liquidityPool.balances(0)];
                    case 1:
                        reserves0 = _a.sent();
                        return [4 /*yield*/, this.liquidityPool.balances(1)];
                    case 2:
                        reserves1 = _a.sent();
                        reserveRatio = ethers_1.BigNumber.from(reserves0).div(ethers_1.BigNumber.from(reserves1));
                        return [2 /*return*/, reserveRatio.toString()];
                }
            });
        });
    };
    Curve.prototype.getLPTokenAmount = function (amounts, isDeposit) {
        if (isDeposit === void 0) { isDeposit = true; }
        return __awaiter(this, void 0, void 0, function () {
            var expectedLPTokenAmount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (amounts.length > 2)
                            throw new Error("Right now we only support two token Curve pools");
                        return [4 /*yield*/, this.liquidityPool.calc_token_amount(amounts, isDeposit)];
                    case 1:
                        expectedLPTokenAmount = _a.sent();
                        return [2 /*return*/, expectedLPTokenAmount];
                }
            });
        });
    };
    Curve.prototype.getEncodedParams = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tokenA, tokenAAmount, tokenB, tokenBAmount, otherToken, reserveRatio, expectedLPTokenAmount, minLPTokenAmount, encodedParams;
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
                            tokenBAmount = ethers_1.BigNumber.from(tokenAAmount)
                                .div(reserveRatio)
                                .toString();
                            otherToken = tokenB;
                        }
                        else {
                            tokenBAmount = this.ohmToBorrow;
                            tokenAAmount = ethers_1.BigNumber.from(tokenBAmount)
                                .mul(reserveRatio)
                                .toString();
                            otherToken = tokenA;
                        }
                        return [4 /*yield*/, this.getLPTokenAmount([tokenAAmount, tokenBAmount], true)];
                    case 4:
                        expectedLPTokenAmount = _a.sent();
                        minLPTokenAmount = ethers_1.BigNumber.from(expectedLPTokenAmount).mul(this.acceptableSlippage).toString();
                        encodedParams = utils_1.defaultAbiCoder.encode(["uint256[2]", "uint256", "address", "address"], [
                            [tokenAAmount, tokenBAmount],
                            minLPTokenAmount,
                            otherToken,
                            this.liquidityPool.address,
                        ]);
                        return [2 /*return*/, encodedParams];
                }
            });
        });
    };
    Curve.abi = abis_1.StableSwapABI;
    return Curve;
}());
exports.Curve = Curve;
