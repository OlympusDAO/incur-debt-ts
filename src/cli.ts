#!/usr/bin/env node

import { Command } from "commander";
import { readFile } from "fs/promises";
import { isOptionalChain } from "typescript";
import pkgInfo from "../package.json";
import { Context } from "./context";
import { IncurDebt } from "./incurDebt";

const program = new Command();

async function deposit(
    amount: string,
    rpcUrl: string,
    chainId: number
): Promise<void> {
    console.log(
        await new IncurDebt(new Context(chainId, rpcUrl)).getDepositTx(amount)
    );
}

async function borrow(
    amount: string,
    rpcUrl: string,
    chainId: number
): Promise<void> {
    console.log(
        await new IncurDebt(new Context(chainId, rpcUrl)).getBorrowTx(amount)
    );
}

async function withdrawLiq(
    liquidity: string,
    lpAddress: string,
    rpcUrl: string,
    chainId: number
): Promise<void> {
    console.log(
        await new IncurDebt(
            new Context(chainId, rpcUrl)
        ).getWithdrawLiquidityTx(liquidity, lpAddress)
    );
}

async function withdraw(
    amount: string,
    rpcUrl: string,
    chainId: number
): Promise<void> {
    console.log(
        await new IncurDebt(new Context(chainId, rpcUrl)).getWithdrawTx(amount)
    );
}

async function repayDebt(
    gohmAmount: string,
    withCollateral: boolean,
    withdrawRest: boolean,
    rpcUrl: string,
    chainId: number
): Promise<void> {
    console.log(
        await new IncurDebt(new Context(chainId, rpcUrl)).getRepayDebtTx(
            gohmAmount,
            withCollateral,
            withdrawRest
        )
    );
}

async function borrowable(
    account: string,
    rpcUrl: string,
    chainId: number
): Promise<void> {
    console.log(
        await new IncurDebt(new Context(chainId, rpcUrl)).getBorrowable(account)
    );
}

async function lpBalance(
    account: string,
    lpAddress: string,
    rpcUrl: string,
    chainId: number
): Promise<void> {
    console.log(
        await new IncurDebt(new Context(chainId, rpcUrl)).getBalanceOfLpToken(
            account,
            lpAddress
        )
    );
}

async function debtLimit(rpcUrl: string, chainId: number): Promise<void> {
    console.log(
        await new IncurDebt(new Context(chainId, rpcUrl)).getGlobalDebtLimit()
    );
}

async function outstandingDebt(rpcUrl: string, chainId: number): Promise<void> {
    console.log(
        await new IncurDebt(
            new Context(chainId, rpcUrl)
        ).getTotalOutstandingDebt()
    );
}

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

    let functions: Command[] = [];

    functions.push(
        program
            .command("deposit")
            .description("Get unsigned tx data for depositing gOHM.")
            .argument("<gohmAmount>", "The amount of gOHM to deposit.")
            .action(async (gohmAmount, options) => {
                await deposit(gohmAmount, options.rpcUrl, options.chainId);
            })
    );

    functions.push(
        program
            .command("borrow")
            .description("Get unsigned tx data for borrowing OHM.")
            .argument("<ohmAmount>", "The amount of OHM to borrow.")
            .action(async (ohmAmount, options) => {
                await borrow(ohmAmount, options.rpcUrl, options.chainId);
            })
    );

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

    functions.push(
        program
            .command("withdraw-liq")
            .description("Get unsigned tx data for withdrawing liquidity.")
            .argument("<liquidity>", "The amount of liquidity to withdraw.")
            .argument("<lpTokenAddress>", "The address of the lp token.")
            .action(async (liquidity, lpTokenAddress, options) => {
                await withdrawLiq(
                    liquidity,
                    lpTokenAddress,
                    options.rpcUrl,
                    options.chainId
                );
            })
    );

    functions.push(
        program
            .command("withdraw")
            .description("Get unsigned tx data for withdrawing gOHM.")
            .argument("<gohmAmount>", "The amount of gOHM to withdraw.")
            .action(async (gohmAmount, options) => {
                await withdraw(gohmAmount, options.rpcUrl, options.chainId);
            })
    );

    functions.push(
        program
            .command("repay-debt")
            .description(
                "Get unsigned tx data for repaying debt either by transferring gOHM or using existing collateral."
            )
            .argument("<gohmAmount>", "The amount of gOHM repay debt with.")
            .option(
                "-wc, --with-collateral",
                "Whether to repay with collateral."
            )
            .option(
                "-wr, --withdraw-rest",
                "Whether to withdraw rest of collateral after repaying."
            )
            .action(async (gohmAmount, options) => {
                const wc: boolean = options.withCollateral != undefined;
                await repayDebt(
                    gohmAmount,
                    wc,
                    wc ? options.withdrawRest != undefined : false,
                    options.rpcUrl,
                    options.chainId
                );
            })
    );

    functions.push(
        program
            .command("borrower-data")
            .description("Get borrower data.")
            .argument(
                "<address>",
                "The address of the borrower to get data for."
            )
            .action(async (address, options) => {
                await borrowerData(address, options.rpcUrl, options.chainId);
            })
    );

    functions.push(
        program
            .command("borrowable")
            .description("Get amount of OHM borrowable by account.")
            .argument(
                "<address>",
                "The address of the account to get amount of borrowable OHM for."
            )
            .action(async (address, options) => {
                await borrowable(address, options.rpcUrl, options.chainId);
            })
    );

    functions.push(
        program
            .command("lp-balance")
            .description("Get account's lp balance by lp address.")
            .argument(
                "<accountAddress>",
                "The address of the account to get lp balance for."
            )
            .argument("<lpAddress>", "The lp address to get balance for.")
            .action(async (accountAddress, lpAddress, options) => {
                await lpBalance(
                    accountAddress,
                    lpAddress,
                    options.rpcUrl,
                    options.chainId
                );
            })
    );

    functions.push(
        program
            .command("debt-limit")
            .description("Get the total debt limit of the system.")
            .action(async (options) => {
                await debtLimit(options.rpcUrl, options.chainId);
            })
    );

    functions.push(
        program
            .command("outstanding-debt")
            .description("Get the total outstanding debt of the system.")
            .action(async (options) => {
                await outstandingDebt(options.rpcUrl, options.chainId);
            })
    );

    for (const fn of functions) {
        fn.requiredOption(
            "-cid, --chain-id <num>",
            "The chain id."
        ).requiredOption("-ru, --rpc-url <str>", "The RPC url.");
    }

    if (process.argv.length < 3) process.argv[2] = "-h";

    await program.parseAsync();
}

cli().then(() => console.log("Exiting CLI."));
