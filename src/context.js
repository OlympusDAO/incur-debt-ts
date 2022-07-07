"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const ethers_1 = require("ethers");
class Context {
    constructor(provider_url) {
        this._provider = new ethers_1.providers.JsonRpcProvider(provider_url);
    }
    setProvider(provider) {
        this._provider = provider;
    }
    get provider() {
        if (this._provider)
            return this._provider;
        throw new Error("Provider must exist.");
    }
}
exports.Context = Context;
