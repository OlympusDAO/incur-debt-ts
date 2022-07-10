import { Context, IncurDebt } from "../../src";

const context = new Context(
    5,
    "https://goerli.infura.io/v3/00000000000000000000000000000000"
);

const incurDebt = new IncurDebt(context);

incurDebt
    .getAddLiquidityTx(
        "0x8A8b5a97978dB4a54367D7DCF6a50980990F2373",
        "sushiswap",
        "0x8a423720e1dC2bbA1f1937D681FF043E9B4C2753",
        0.01,
        "20000000000",
        [],
        []
    )
    .then((result) => console.log(result));
