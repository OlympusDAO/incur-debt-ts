#!/usr/bin/env node

import { Command } from "commander";
import { readFile } from "fs/promises";
import pkgInfo from "../package.json";
import { Context } from "./context";
import { IncurDebt } from "./incurDebt";

const program = new Command();

async function addLiq(path: string, absolutePath: boolean): Promise<void> {
    const jsonArgs = JSON.parse(
        await readFile(absolutePath ? path : process.cwd() + "/" + path, "utf8")
    );

    console.log(
        await new IncurDebt(
            new Context(jsonArgs.chainId, jsonArgs.rpcUrl)
        ).getAddLiquidityTx(
            jsonArgs.sender,
            jsonArgs.strategy,
            jsonArgs.lpAddress,
            jsonArgs.slippage,
            jsonArgs.ohmAmount,
            jsonArgs.otherTokens,
            jsonArgs.otherTokenAmounts
        )
    );
}

async function borrowerData(
    borrower: string,
    rpcUrl: string,
    chainId: number
): Promise<void> {
    console.log(
        await new IncurDebt(new Context(chainId, rpcUrl)).getBorrowerData(
            borrower
        )
    );
}

async function cli(): Promise<void> {
    program
        .name("incur-debt")
        .description("CLI to library for Olympus Incur Debt partners.")
        .version(pkgInfo.version);

    program
        .command("add-liq")
        .description(
            "Get unsigned tx data for borrowing OHM and adding liquidity with other parameters."
        )
        .argument(
            "<path>",
            "The filepath to a json file containing all of the necessary arguments."
        )
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

    if (process.argv.length < 3) process.argv[2] = "-h";

    await program.parseAsync();
}

cli().then(() => console.log("Exiting CLI."));
