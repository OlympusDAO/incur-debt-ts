import { Contract } from "ethers";

export const IncurDebtAddress = "0x0000000000000000000000000000000000000000";

export const IncurDebtABI = [
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

export class IncurDebt {
  static abi = IncurDebtABI;
  //  protected contract: Contract = new Contract(IncurDebtAddress, IncurDebtABI, )
}
