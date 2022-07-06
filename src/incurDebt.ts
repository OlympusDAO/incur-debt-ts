import { Contract, providers } from "ethers";
import { IncurDebtABI } from "./abi/abis";
import { IncurDebtAddress, ohm, Strategies } from "./constants";
import { Context } from "./context";
import { Uniswap } from "./strategies/Uniswap";

type JsonRpcProvider = providers.JsonRpcProvider;

export class IncurDebt {
    private abi = IncurDebtABI;

    private strategies: { [key: string]: string } = Strategies;

    private context = new Context("https://mainnet.infura.io/v3/9a9cc37c69df4dcab372cc09acc4598c");

    private provider: JsonRpcProvider;
    
    protected incurDebtContract: Contract;

    constructor() {
        this.provider = this.context.getProvider();

        this.incurDebtContract = new Contract(IncurDebtAddress, this.abi, this.provider);
    }

    async encodeBorrowParameters(strategy: string, lpAddress: string, slippage: number = 0.05, ohmAmount: string) {
        if (!this.strategies[strategy]) throw new Error("The only available strategies are Curve, Uniswap, Sushiswap, or Balancer.");

        if (strategy == "uniswap" || strategy == "sushiswap") {
            const UniStrategy = new Uniswap(lpAddress, slippage, ohmAmount, this.provider);
            return UniStrategy.getEncodedParams();
        }
    }
}
