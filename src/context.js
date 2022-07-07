"use strict";
exports.__esModule = true;
exports.Context = void 0;
var ethers_1 = require("ethers");
var Context = /** @class */ (function () {
    function Context(provider_url) {
        this._provider = new ethers_1.providers.JsonRpcProvider(provider_url);
    }
    Context.prototype.setProvider = function (provider) {
        this._provider = provider;
    };
    Object.defineProperty(Context.prototype, "provider", {
        get: function () {
            if (this._provider)
                return this._provider;
            throw new Error("Provider must exist.");
        },
        enumerable: false,
        configurable: true
    });
    return Context;
}());
exports.Context = Context;
