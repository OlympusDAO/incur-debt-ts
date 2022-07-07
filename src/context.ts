import { providers } from "ethers";
type JsonRpcProvider = providers.JsonRpcProvider;

export class Context {
    private _provider: JsonRpcProvider;

    constructor(provider_url: string) {
        this._provider = new providers.JsonRpcProvider(provider_url);
    }

    setProvider(provider: JsonRpcProvider): void {
        this._provider = provider;
    }

    get provider(): JsonRpcProvider {
        if (this._provider) return this._provider as JsonRpcProvider;
        throw new Error("Provider must exist.");
    }
}
