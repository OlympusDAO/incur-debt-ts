"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const src_1 = require("../../src");
dotenv_1.default.config();
const context = new src_1.Context(5, process.env.GOERLI_RPC_URL);
const incurDebt = new src_1.IncurDebt(context);
incurDebt
    .getAddLiquidityTx("0x8A8b5a97978dB4a54367D7DCF6a50980990F2373", "sushiswap", "0x8a423720e1dC2bbA1f1937D681FF043E9B4C2753", 0.01, "20000000000", [], [])
    .then((result) => console.log(result));
