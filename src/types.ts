export interface StrategyInterface {
    getAddLiquidityCalldata(): Promise<string>;
}

export interface BorrowerData {
    debt: string;
    limit: string;
    collateralInGOHM: string;
    unwrappedGOHM: string;
    isNonLpBorrower: boolean;
    isLpBorrower: boolean;
}
