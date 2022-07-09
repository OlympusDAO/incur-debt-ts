"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const src_1 = require("../../src");
dotenv_1.default.config();
const context = new src_1.Context(1, process.env.MAINNET_RPC_URL);
const incurDebt = new src_1.IncurDebt(context);
incurDebt
    .getAddLiquidityTx("0xA52Fd396891E7A74b641a2Cb1A6999Fcf56B077e", "sushiswap", "0xe9ab8038ee6dd4fcc7612997fe28d4e22019c4b4", 0.01, "10000000000000", [], [])
    .then((result) => console.log(result));
