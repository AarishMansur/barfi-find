#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import { showBanner } from "./banner";
import { analyzeDepencies } from "./analyzer";
import path from "path";

const program = new Command();

program
  .command("start")
  .description("Launch the Barfi dashboard visual UI interface")
  .action(async () => {
    await showBanner();
    console.log(chalk.green("✨ Launching Barfi UI..."));
    
    // TODO: In the future, you will trigger your Express/Vite UI server spin-up here!
  });

  program
  .command("scan")
  .description("Scan a folder architecture")
  .action(async(target : string)=>{
   const targetDir = path.resolve(target || process.cwd())

   console.log(`🔍 Scanning target path: ${chalk.cyan(targetDir)} ${chalk.green("🐶")}\n`);
    try {
        const report = analyzeDepencies(targetDir);

        
        console.log(chalk.bold(" --- DEPENDENCY ANALYSIS REPORT --- 📊\n"));
        
        console.log(`${chalk.green("✅ Used Dependencies:")} [${report.used.length}]`);
        if (report.used.length > 0) console.log(`   ${report.used.join(", ")}`);
        
        console.log(`\n${chalk.yellow("⚠️ Unused Dependencies:")} [${report.unused.length}]`);
        if (report.unused.length > 0) {
            console.log(`   ${chalk.yellow(report.unused.join(", "))}`);
        } else {
            console.log("   None! Codebase is perfectly lean.");
        }

        console.log(`\n${chalk.red("❌ Missing Imports:")} [${report.missing.length}]`);
        if (report.missing.length > 0) {
            console.log(`   ${chalk.red(report.missing.join(", "))}`);
        } else {
            console.log("   None! All imported items exist in package.json.");
        }

        console.log(`\n${chalk.magenta("🚨 Possible Duplicates:")} [${report.duplicates.length}]`);
        if (report.duplicates.length > 0) {
            console.log(`   ${chalk.magenta(report.duplicates.join(", "))}`);
        } else {
            console.log("   None! No cross-contamination between dependencies.");
        }

        console.log("\n");

    } catch (err: any) {
        console.error(chalk.red(`\n💥 Error while analyzing: ${err.message}`));
    }
    
  })

program.parseAsync(process.argv);

