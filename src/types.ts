import { BigNumber } from "ethers";

export interface StrategyInterface {
    getAddLiquidityCalldata(): Promise<string>;
}

export interface BorrowerData {
    debt: BigNumber;
    limit: BigNumber;
    collateralInGOHM: BigNumber;
    unwrappedGOHM: BigNumber;
    isNonLpBorrower: boolean;
    isLpBorrower: boolean;
}
