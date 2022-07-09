import dotenv from "dotenv";
import { Context, IncurDebt } from "../../src";

dotenv.config();

const context = new Context(1, process.env.MAINNET_RPC_URL!);

const incurDebt = new IncurDebt(context);

incurDebt
    .getAddLiquidityTx(
        "0xA52Fd396891E7A74b641a2Cb1A6999Fcf56B077e",
        "sushiswap",
        "0xe9ab8038ee6dd4fcc7612997fe28d4e22019c4b4",
        0.01,
        "10000000000000",
        [],
        []
    )
    .then((result) => console.log(result));
