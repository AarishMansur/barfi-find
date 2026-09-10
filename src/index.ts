#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import { showBanner } from "./banner";
import { analyzeDepencies } from "./analyzer";
import path from "path";
import * as p from "@clack/prompts";

const program = new Command();

program
    .name("barfi")
    .exitOverride();

program
    .command("start")
    .description("Launch the Barfi dashboard visual UI interface")
    .action(async () => {
        p.log.success(chalk.emerald("✨ Launching Barfi UI Dashboard..."));
    });

program
    .command("scan [target]")
    .description("Scan a folder architecture")
    .action(async (target: string | undefined) => {
        const targetDir = path.resolve(target || process.cwd());

        const s = p.spinner();
        s.start(chalk.dim(`Analyzing codebase structure at ${chalk.cyan(targetDir)}`));

        try {
            const report = analyzeDepencies(targetDir);
            s.stop(chalk.green("✨ Analysis complete!"));

            const totalDeps = report.used.length + report.unused.length;

            let reportOutput = "";

            reportOutput += ` ${chalk.bgCyan.black(" 📊 SUMMARY TELEMETRY ")} `;
            reportOutput += chalk.dim(`Total Monitored: ${totalDeps} dependencies\n\n`);

            reportOutput += `${chalk.bold.green(" 📦 USED DEPENDENCIES ")} ${chalk.gray(`[${report.used.length}]`)}\n`;
            if (report.used.length > 0) {
                reportOutput += `${chalk.dim("  ├─")} ${report.used.map(d => chalk.white(d)).join(chalk.dim(", "))}\n`;
            } else {
                reportOutput += `${chalk.dim("  └─ (None detected in codebase files)")}\n`;
            }
            reportOutput += "\n";

            reportOutput += `${chalk.bold.yellow(" ⚠️ UNUSED DEPENDENCIES ")} ${chalk.gray(`[${report.unused.length}]`)}\n`;
            if (report.unused.length > 0) {
                reportOutput += `${chalk.dim("  ├─")} ${report.unused.map(d => chalk.yellowBright(d)).join(chalk.dim(", "))}\n`;
            } else {
                reportOutput += `${chalk.dim("  └─")} ${chalk.greenBright("Perfect! Your package.json is lean and clean.")}\n`;
            }
            reportOutput += "\n";

            reportOutput += `${chalk.bold.red(" ❌ MISSING IMPORTS ")} ${chalk.gray(`[${report.missing.length}]`)}\n`;
            if (report.missing.length > 0) {
                reportOutput += `${chalk.dim("  ├─")} ${report.missing.map(d => chalk.redBright(d)).join(chalk.dim(", "))}\n`;
                reportOutput += `  ${chalk.italic.dim("💡 Fix: Run 'pnpm add <dep>' to install missing items.")}\n`;
            } else {
                reportOutput += `${chalk.dim("  └─")} ${chalk.greenBright("Excellent! All imported modules exist in package.json.")}\n`;
            }
            reportOutput += "\n";

            reportOutput += `${chalk.bold.magenta(" 🚨 DUPLICATE VERSIONS ")} ${chalk.gray(`[${report.duplicates.length}]`)}\n`;
            if (report.duplicates.length > 0) {
                reportOutput += `${chalk.dim("  └─")} ${report.duplicates.map(d => chalk.magentaBright(d)).join(chalk.dim(", "))}\n`;
            } else {
                reportOutput += `${chalk.dim("  └─")} ${chalk.greenBright("No cross-contamination or duplicates found.")}\n`;
            }

            p.box(reportOutput, chalk.cyan.bold(" BARFI DEPENDENCY HEALTH REPORT 🐶 "));

        } catch (err: any) {
            s.stop(chalk.red("💥 Analysis process aborted."));
            p.log.error(chalk.bold.red(`Error details: ${err.message}`));
        }
    });

async function startInteractiveShell() {
    await showBanner();

    await new Promise((resolve) => setTimeout(resolve, 50));

    p.intro(chalk.bgCyan.black.bold(" 🐾 BARFI INTERACTIVE SHELL "));

    while (true) {
        const commandInput = await p.text({
            message: chalk.bold.white("Where should Barfi look?"),
            placeholder: "barfi scan ./src (or just press enter for current directory)",
            defaultValue: "barfi scan",
        });

        if (p.isCancel(commandInput)) {
            p.outro(chalk.bold.yellow("Goodbye! Drive safe! 🐶"));
            process.exit(0);
        }

        const input = commandInput.trim();

        if (input === "exit" || input === "quit") {
            p.outro(chalk.bold.yellow("Goodbye! Drive safe! 🐶"));
            process.exit(0);
        }

        let args = input.split(/\s+/).filter(Boolean);

        if (args.length === 0) {
            args = ["scan"];
        } else if (args[0] === "barfi") {
            args.shift();
            if (args.length === 0) args = ["scan"];
        }

        try {
            await program.parseAsync(["node", "barfi", ...args]);
        } catch (err) {
            // Caught seamlessly to preserve persistent terminal session frame
        }

        console.log("\n");
    }
}

startInteractiveShell();
