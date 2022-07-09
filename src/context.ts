import { providers } from "ethers";
type JsonRpcProvider = providers.JsonRpcProvider;

export class Context {
    private _provider: JsonRpcProvider;
    private _chainId: number;

    constructor(chainId: number, providerUrl: string) {
        this._provider = new providers.JsonRpcProvider(providerUrl);
        this._chainId = chainId;
    }

    setProvider(provider: JsonRpcProvider): void {
        this._provider = provider;
    }

    get provider(): JsonRpcProvider {
        if (this._provider) return this._provider as JsonRpcProvider;
        throw new Error("Provider must exist.");
    }

    get chainId(): number {
        if (this._chainId) return this._chainId;
        throw new Error("ChainID must exist");
    }
}
