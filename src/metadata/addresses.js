"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalancerHelperAddress = exports.BalancerVaultAddress = exports.StrategyAddresses = exports.OhmAddress = exports.IncurDebtAddress = void 0;
const IncurDebtAddress = (chainId) => {
    if (chainId == 1)
        return "0xd9d87586774Fb9d036fa95A5991474513Ff6C96E";
    if (chainId == 5)
        return "0x5Fd05A2f73C3cC77a1d2CdEEae4C0B0149E30b94";
};
exports.IncurDebtAddress = IncurDebtAddress;
const OhmAddress = (chainId) => {
    if (chainId == 1)
        return "0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5";
    if (chainId == 5)
        return "0x0595328847af962f951a4f8f8ee9a3bf261e4f6b";
};
exports.OhmAddress = OhmAddress;
const StrategyAddresses = (chainId) => {
    if (chainId == 1)
        return {
            curve: "0xFc495557A638B2322443FAf76F5e860085C36D38",
            uniswap: "0xc50A61C0A24d60c9d2Ac7bBB4682F685537260ac",
            sushiswap: "0x0392e97abC5986cc3fdb083e6B90AA941ec4D1b3",
            balancer: "0x0392e97abC5986cc3fdb083e6B90AA941ec4D1b3",
        };
    if (chainId == 5)
        return {
            curve: "0x5fc8B0f497ea803cf906d2dE3CAf94d514B6eDF7",
            uniswap: "0xDfd60308626CF3AFF13975a8153d918338F0e1cB",
            sushiswap: "0x07AAA3701127eB510E7Fc3fB182EEe84DCCdb1De",
            balancer: "0x22535579D828b3E317434795A63931Ef3f7e5dA1",
        };
};
exports.StrategyAddresses = StrategyAddresses;
exports.BalancerVaultAddress = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
exports.BalancerHelperAddress = "0x5aDDCCa35b7A0D07C74063c48700C8590E87864E";
