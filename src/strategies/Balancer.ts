import { Contract, providers } from "ethers";
import { defaultAbiCoder as abiCoder } from "ethers/lib/utils";
import { BalancerHelpersABI, BalancerVaultABI } from "../metadata/abis";
import {
    BalancerHelperAddress,
    BalancerVaultAddress,
    IncurDebtAddress,
} from "../metadata/addresses";

type JsonRpcProvider = providers.JsonRpcProvider;

export class Balancer {
    static abi = BalancerVaultABI;

    private msgSender: string;

    private vault: Contract;

    private balancerHelpers: Contract;

    private pool: string;

    private otherTokens: string[];

    private otherTokenAmounts: string[];

    private acceptableSlippage: number;

    private ohmToBorrow: string;

    constructor(
        sender: string,
        poolId: string,
        tokens: string[],
        tokenAmounts: string[],
        slippage: number = 0.01,
        ohmAmount: string,
        provider: JsonRpcProvider
    ) {
        this.msgSender = sender;

        this.vault = new Contract(BalancerVaultAddress, Balancer.abi, provider);

        this.balancerHelpers = new Contract(
            BalancerHelperAddress,
            BalancerHelpersABI,
            provider
        );

        this.pool = poolId;

        this.otherTokens = tokens;

        this.otherTokenAmounts = tokenAmounts;

        this.acceptableSlippage = 1 - slippage;

        this.ohmToBorrow = ohmAmount;
    }

    async getPoolTokens(): Promise<string[]> {
        if (!this.vault || !this.pool)
            throw new Error("Vault and liquidity pool not initialized");

        const { tokens, balances, lastTimestamp } =
            await this.vault.getPoolTokens(this.pool);
        return tokens;
    }

    async verifyOtherTokens(): Promise<boolean> {
        if (!this.vault || !this.pool)
            throw new Error("Vault and liquidity pool not initialized");

        const poolTokens = await this.getPoolTokens();

        for (let i = 0; i < this.otherTokens.length; i++) {
            if (!poolTokens.includes(this.otherTokens[i])) return false;
        }

        return true;
    }

    async getEncodedParams() {
        if (!this.verifyOtherTokens())
            throw new Error("Passed tokens do not match the pool.");

        const userData = abiCoder.encode(
            ["enum", "uint256", "uint256"],
            [1, this.otherTokenAmounts, 0]
        );

        const joinPoolRequest = {
            assets: this.otherTokens,
            maxAmountsIn: this.otherTokenAmounts,
            userData: userData,
            fromInternalBalance: false,
        };

        const minPoolTokensOut =
            await this.balancerHelpers.callStatic.queryJoin(
                this.pool,
                IncurDebtAddress,
                this.msgSender,
                joinPoolRequest
            );

        const encodedParams = abiCoder.encode(
            ["bytes", "address[]", "uint256[]", "uint256"],
            [
                this.pool,
                this.otherTokens,
                this.otherTokenAmounts,
                minPoolTokensOut,
            ]
        );

        return encodedParams;
    }
}
