import { StrategyInterface } from "../types";
import { BigNumber, Contract, providers } from "ethers";
import { defaultAbiCoder as abiCoder } from "ethers/lib/utils";
import { BalancerHelpersABI, BalancerVaultABI } from "../metadata/abis";
import {
    BalancerHelperAddress,
    BalancerVaultAddress,
    IncurDebtAddress,
    OhmAddress,
} from "../metadata/addresses";

type JsonRpcProvider = providers.JsonRpcProvider;

export class Balancer implements StrategyInterface {
    static abi = BalancerVaultABI;

    private msgSender: string;

    private vault: Contract;

    private balancerHelpers: Contract;

    private pool: string;

    private assets: string[];

    private assetAmounts: string[];

    private acceptableSlippage: number;

    private ohmToBorrow: string;

    constructor(
        sender: string,
        poolId: string,
        tokens: string[],
        tokenAmounts: string[],
        slippage: number = 0.01,
        ohmAmount: string,
        provider: JsonRpcProvider,
        chainId: number
    ) {
        this.msgSender = sender;

        this.vault = new Contract(BalancerVaultAddress, Balancer.abi, provider);

        this.balancerHelpers = new Contract(
            BalancerHelperAddress,
            BalancerHelpersABI,
            provider
        );

        this.pool = poolId;

        this.ohmToBorrow = ohmAmount;

        tokens.push(OhmAddress(chainId)!);
        tokenAmounts.push(this.ohmToBorrow);
        this.assetAmounts = tokenAmounts.sort((a, b) => {
            const indexOfA = tokenAmounts.indexOf(a);
            const indexOfB = tokenAmounts.indexOf(b);
            return BigNumber.from(tokens[indexOfA])
                .sub(tokens[indexOfB])
                .toNumber();
        });

        this.assets = tokens.sort((a, b) => {
            return BigNumber.from(a).sub(b).toNumber();
        });

        this.acceptableSlippage = (1 - slippage) * 1000;
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

        for (let i = 0; i < this.assets.length; i++) {
            if (!poolTokens.includes(this.assetAmounts[i])) return false;
        }

        return true;
    }

    async getAddLiquidityCalldata(): Promise<string> {
        if (!this.verifyOtherTokens())
            throw new Error("Passed tokens do not match the pool.");

        const userData = abiCoder.encode(
            ["enum", "uint256", "uint256"],
            [1, this.assetAmounts, 0]
        );

        const joinPoolRequest = {
            assets: this.assets,
            maxAmountsIn: this.assetAmounts,
            userData: userData,
            fromInternalBalance: false,
        };

        const expectedPoolTokensOut =
            await this.balancerHelpers.callStatic.queryJoin(
                this.pool,
                IncurDebtAddress,
                this.msgSender,
                joinPoolRequest
            );

        const minPoolTokensOut = BigNumber.from(expectedPoolTokensOut)
            .mul(this.acceptableSlippage)
            .div("1000");

        const encodedParams = abiCoder.encode(
            ["bytes", "address[]", "uint256[]", "uint256"],
            [this.pool, this.assets, this.assetAmounts, minPoolTokensOut]
        );

        return encodedParams;
    }
}
