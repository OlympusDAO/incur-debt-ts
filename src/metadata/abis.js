"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERC20ABI = exports.BalancerVaultABI = exports.BalancerHelpersABI = exports.JoinPoolRequest = exports.UniswapV2ABI = exports.StableSwapABI = exports.IncurDebtABI = exports.BorrowerData = void 0;
exports.BorrowerData = [
    "tuple(uint128 debt, uint128 limit, uint128 collateralInGOHM, uint128 wrappedGOHM, bool isNonLpBorrower, bool isLpBorrower)",
];
exports.IncurDebtABI = [
    "function deposit(uint256)",
    "function borrow(uint256)",
    "function createLP(uint256, address, bytes) returns (uint256)",
    "function removeLP(uint256, address, address, bytes) returns (uint256)",
    "function withdrawLP(uint256, address)",
    "function withdraw(uint256)",
    "function repayDebtWithCollateral() public",
    "function repayDebtWithCollateralAndWithdrawTheRest()",
    "function repayDebtWithOHM(uint256 _ohmAmount)",
    "function getAvailableToBorrow() view returns (uint256)",
    "function totalOutstandingGlobalDebt() view returns (uint256)",
    "function globalDebtLimit() view returns (uint256)",
    "function lpTokenOwnership(address, address) view returns (uint256)",
    `function borrowers(address) view returns (${exports.BorrowerData})`,
];
exports.StableSwapABI = [
    "function coins(uint256) view returns (address)",
    "function balances(uint256) view returns (address)",
    "function calc_token_amount(uint256[2], bool) view returns (uint256)",
];
exports.UniswapV2ABI = [
    "function token0() view returns (address)",
    "function token1() view returns (address)",
    "function getReserves() view returns (uint112, uint112, uint32)",
];
exports.JoinPoolRequest = [
    "tuple(address[] assets, uint256[] maxAmountsIn, bytes userData, bool fromInternalBalance)",
];
exports.BalancerHelpersABI = [
    `function queryJoin(bytes32, address, address, ${exports.JoinPoolRequest}) returns (uint256, uint256[])`,
];
exports.BalancerVaultABI = [
    "function getPoolTokens(bytes32) view returns (IERC20[], uint256[], uint256)",
];
exports.ERC20ABI = [
    "function approve(address, uint256) returns (bool)",
    "function transferFrom(address, address, uint256) returns (bool)",
    "function transfer(address, uint256) returns (bool)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns(uint256)",
    "function allowance(address, address) view returns (uint256)",
];
