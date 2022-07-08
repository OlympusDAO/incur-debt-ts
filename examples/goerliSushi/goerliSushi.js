"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../src");
const context = new src_1.Context("https://goerli.infura.io/v3/9a9cc37c69df4dcab372cc09acc4598c");
const incurDebt = new src_1.IncurDebt(context);
incurDebt
    .encodeBorrowParameters("0x8A8b5a97978dB4a54367D7DCF6a50980990F2373", "sushiswap", "0x8a423720e1dC2bbA1f1937D681FF043E9B4C2753", 0.01, "20000000000", [], [])
    .then((result) => console.log(result));
