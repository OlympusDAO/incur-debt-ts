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
    program
        .command("add-liq")
        .description("Get unsigned tx data for borrowing OHM and adding liquidity with other parameters.")
        .argument("<path>", "The filepath to a json file containing all of the necessary arguments.")
        .option("-ap, --absolute-path", "Specify that path is absolute")
        .action(async (path, options) => {
        await addLiq(path, options.absolutePath ? true : false);
    });
    program
        .command("borrower-data")
        .description("Get borrower data.")
        .argument("<address>", "The address of the borrower to get data for.")
        .requiredOption("-cid, --chain-id <num>", "The chain id.")
        .requiredOption("-ru, --rpc-url <str>", "The RPC url.")
        .action(async (address, options) => {
        await borrowerData(address, options.rpcUrl, options.chainId);
    });
    if (process.argv.length < 3)
        process.argv[2] = "-h";
    await program.parseAsync();
}
cli().then(() => console.log("Exiting CLI."));
