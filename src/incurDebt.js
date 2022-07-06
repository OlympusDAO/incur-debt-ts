"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncurDebt = exports.IncurDebtABI = exports.IncurDebtAddress = void 0;
exports.IncurDebtAddress = "0x0000000000000000000000000000000000000000";
exports.IncurDebtABI = [
    "function deposit(uint256) external",
    "function borrow(uint256) external",
    "function createLP(uint256, address, bytes) external returns (uint256)",
    "function removeLP(uint256, address, address, bytes) external returns (uint256)",
    "function withdrawLP(uint256, address) external",
    "function withdraw(uint256) external",
    "function repayDebtWithCollateral() public",
    "function repayDebtWithCollateralAndWithdrawTheRest() external",
    "function repayDebtWithOHM(uint256 _ohmAmount) external",
    "function getAvailableToBorrow() public view returns (uint256)",
];
class IncurDebt {
}
exports.IncurDebt = IncurDebt;
IncurDebt.abi = exports.IncurDebtABI;
