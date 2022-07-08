"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const ethers_1 = require("ethers");
class Context {
    constructor(chainId, providerUrl) {
        this._provider = new ethers_1.providers.JsonRpcProvider(providerUrl);
        this._chainId = chainId;
    }
    setProvider(provider) {
        this._provider = provider;
    }
    get provider() {
        if (this._provider)
            return this._provider;
        throw new Error("Provider must exist.");
    }
    get chainId() {
        if (this._chainId)
            return this._chainId;
        throw new Error("ChainID must exist");
    }
}
exports.Context = Context;
