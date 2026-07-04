import chalk from "chalk";
import { Command } from "commander";
import { showBanner } from "./banner";

const program = new Command();

program
  .name("barfi")
  .description("Analyze your project's dependency health")
  .argument("[target]", "Define project path")
  .action(async (target?: string) => {
    await showBanner();
    process.stdout.write(
    `${chalk.white(target || process.cwd())} ${chalk.green("🐶")} `
  );

    // add later logic for analyze project
  });

program.parseAsync(process.argv);

