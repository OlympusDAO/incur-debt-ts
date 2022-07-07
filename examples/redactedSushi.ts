import { Context, IncurDebt } from "../src";

const context = new Context(
    "https://mainnet.infura.io/v3/9a9cc37c69df4dcab372cc09acc4598c"
);

const incurDebt = new IncurDebt(context);

incurDebt
    .encodeBorrowParameters(
        "0xA52Fd396891E7A74b641a2Cb1A6999Fcf56B077e",
        "sushiswap",
        "0xe9ab8038ee6dd4fcc7612997fe28d4e22019c4b4",
        0.01,
        "10000000000000",
        [],
        []
    )
    .then((result) => console.log(result));
