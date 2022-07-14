#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const promises_1 = require("fs/promises");
const package_json_1 = __importDefault(require("../package.json"));
const context_1 = require("./context");
const incurDebt_1 = require("./incurDebt");
const program = new commander_1.Command();
async function deposit(amount, rpcUrl, chainId) {
    console.log(await new incurDebt_1.IncurDebt(new context_1.Context(chainId, rpcUrl)).getDepositTx(amount));
}
async function borrow(amount, rpcUrl, chainId) {
    console.log(await new incurDebt_1.IncurDebt(new context_1.Context(chainId, rpcUrl)).getBorrowTx(amount));
}
async function withdrawLiq(liquidity, lpAddress, rpcUrl, chainId) {
    console.log(await new incurDebt_1.IncurDebt(new context_1.Context(chainId, rpcUrl)).getWithdrawLiquidityTx(liquidity, lpAddress));
}
async function withdraw(amount, rpcUrl, chainId) {
    console.log(await new incurDebt_1.IncurDebt(new context_1.Context(chainId, rpcUrl)).getWithdrawTx(amount));
}
async function repayDebt(gohmAmount, withCollateral, withdrawRest, rpcUrl, chainId) {
    console.log(await new incurDebt_1.IncurDebt(new context_1.Context(chainId, rpcUrl)).getRepayDebtTx(gohmAmount, withCollateral, withdrawRest));
}
async function borrowable(account, rpcUrl, chainId) {
    console.log(await new incurDebt_1.IncurDebt(new context_1.Context(chainId, rpcUrl)).getBorrowable(account));
}
async function lpBalance(account, lpAddress, rpcUrl, chainId) {
    console.log(await new incurDebt_1.IncurDebt(new context_1.Context(chainId, rpcUrl)).getBalanceOfLpToken(account, lpAddress));
}
async function debtLimit(rpcUrl, chainId) {
    console.log(await new incurDebt_1.IncurDebt(new context_1.Context(chainId, rpcUrl)).getGlobalDebtLimit());
}
async function outstandingDebt(rpcUrl, chainId) {
    console.log(await new incurDebt_1.IncurDebt(new context_1.Context(chainId, rpcUrl)).getTotalOutstandingDebt());
}
async function addLiq(path, absolutePath) {
    const jsonArgs = JSON.parse(await (0, promises_1.readFile)(absolutePath ? path : process.cwd() + "/" + path, "utf8"));
    console.log(await new incurDebt_1.IncurDebt(new context_1.Context(jsonArgs.chainId, jsonArgs.rpcUrl)).getAddLiquidityTx(jsonArgs.sender, jsonArgs.strategy, jsonArgs.lpAddress, jsonArgs.slippage, jsonArgs.ohmAmount, jsonArgs.otherTokens, jsonArgs.otherTokenAmounts));
}
async function borrowerData(borrower, rpcUrl, chainId) {
    console.log(await new incurDebt_1.IncurDebt(new context_1.Context(chainId, rpcUrl)).getBorrowerData(borrower));
}
async function cli() {
    program
        .name("incur-debt")
        .description("CLI to library for Olympus Incur Debt partners.")
        .version(package_json_1.default.version);
    let functions = [];
    functions.push(program
        .command("deposit")
        .description("Get unsigned tx data for depositing gOHM.")
        .argument("<gohmAmount>", "The amount of gOHM to deposit.")
        .action(async (gohmAmount, options) => {
        await deposit(gohmAmount, options.rpcUrl, options.chainId);
    }));
    functions.push(program
        .command("borrow")
        .description("Get unsigned tx data for borrowing OHM.")
        .argument("<ohmAmount>", "The amount of OHM to borrow.")
        .action(async (ohmAmount, options) => {
        await borrow(ohmAmount, options.rpcUrl, options.chainId);
    }));
    program
        .command("add-liq")
        .description("Get unsigned tx data for borrowing OHM and adding liquidity with other parameters.")
        .argument("<path>", "The filepath to a json file containing all of the necessary arguments.")
        .option("-ap, --absolute-path", "Specify that path is absolute")
        .action(async (path, options) => {
        await addLiq(path, options.absolutePath ? true : false);
    });
    functions.push(program
        .command("withdraw-liq")
        .description("Get unsigned tx data for withdrawing liquidity.")
        .argument("<liquidity>", "The amount of liquidity to withdraw.")
        .argument("<lpTokenAddress>", "The address of the lp token.")
        .action(async (liquidity, lpTokenAddress, options) => {
        await withdrawLiq(liquidity, lpTokenAddress, options.rpcUrl, options.chainId);
    }));
    functions.push(program
        .command("withdraw")
        .description("Get unsigned tx data for withdrawing gOHM.")
        .argument("<gohmAmount>", "The amount of gOHM to withdraw.")
        .action(async (gohmAmount, options) => {
        await withdraw(gohmAmount, options.rpcUrl, options.chainId);
    }));
    functions.push(program
        .command("repay-debt")
        .description("Get unsigned tx data for repaying debt either by transferring gOHM or using existing collateral.")
        .argument("<gohmAmount>", "The amount of gOHM repay debt with.")
        .option("-wc, --with-collateral", "Whether to repay with collateral.")
        .option("-wr, --withdraw-rest", "Whether to withdraw rest of collateral after repaying.")
        .action(async (gohmAmount, options) => {
        const wc = options.withCollateral != undefined;
        await repayDebt(gohmAmount, wc, wc ? options.withdrawRest != undefined : false, options.rpcUrl, options.chainId);
    }));
    functions.push(program
        .command("borrower-data")
        .description("Get borrower data.")
        .argument("<address>", "The address of the borrower to get data for.")
        .action(async (address, options) => {
        await borrowerData(address, options.rpcUrl, options.chainId);
    }));
    functions.push(program
        .command("borrowable")
        .description("Get amount of OHM borrowable by account.")
        .argument("<address>", "The address of the account to get amount of borrowable OHM for.")
        .action(async (address, options) => {
        await borrowable(address, options.rpcUrl, options.chainId);
    }));
    functions.push(program
        .command("lp-balance")
        .description("Get account's lp balance by lp address.")
        .argument("<accountAddress>", "The address of the account to get lp balance for.")
        .argument("<lpAddress>", "The lp address to get balance for.")
        .action(async (accountAddress, lpAddress, options) => {
        await lpBalance(accountAddress, lpAddress, options.rpcUrl, options.chainId);
    }));
    functions.push(program
        .command("debt-limit")
        .description("Get the total debt limit of the system.")
        .action(async (options) => {
        await debtLimit(options.rpcUrl, options.chainId);
    }));
    functions.push(program
        .command("outstanding-debt")
        .description("Get the total outstanding debt of the system.")
        .action(async (options) => {
        await outstandingDebt(options.rpcUrl, options.chainId);
    }));
    for (const fn of functions) {
        fn.requiredOption("-cid, --chain-id <num>", "The chain id.").requiredOption("-ru, --rpc-url <str>", "The RPC url.");
    }
    if (process.argv.length < 3)
        process.argv[2] = "-h";
    await program.parseAsync();
}
cli().then(() => console.log("Exiting CLI."));
