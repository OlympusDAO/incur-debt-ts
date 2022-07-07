export interface StrategyInterface {
    getEncodedParams(): Promise<string>;
}
