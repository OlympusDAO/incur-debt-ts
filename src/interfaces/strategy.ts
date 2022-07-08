export interface StrategyInterface {
    getAddLiquidityCalldata(): Promise<string>;
}
