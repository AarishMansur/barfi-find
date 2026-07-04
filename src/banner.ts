import boxen from "boxen";
import ora from "ora";
import figlet from "figlet";
import chalk from "chalk";

function colorFigletText(text: string, color: (value: string) => string) {
  return text
    .split("\n")
    .map((line) => color(line))
    .join("\n");
}

export async function showBanner() {
  const spinner = ora({
    text: "Initializing...",
    color: "cyan",
  }).start();

  await new Promise((r) => setTimeout(r, 700));
  spinner.text = "Please wait...";
  await new Promise((r) => setTimeout(r, 700));
  spinner.succeed("Ready");

  console.clear();

  const title = figlet.textSync("BARFI", {
    font: "Larry 3D",
    horizontalLayout: "full",
  });

  const subtitle = figlet.textSync("FINDS", {
    font: "Larry 3D",
    horizontalLayout: "full",
  });

  console.log("\n");
  console.log(colorFigletText(title, chalk.cyanBright.bold));
  console.log(colorFigletText(subtitle, chalk.yellowBright.bold));

  console.log(
  boxen(
    `${chalk.bold.white("🐾  Barfi Finds")}\n` +
      `${chalk.dim("Analyze your project's dependency health.")}\n\n` +

      `${chalk.bold.cyan("Commands")}\n` +
      `  ${chalk.white("start")}   Analyze a project\n` +
      `  ${chalk.white("help")}    Show available commands\n` +
      `  ${chalk.white("version")} Show current version\n\n` +

      `${chalk.bold.yellow("Examples")}\n` +
      `  ${chalk.cyan("barfi start")}\n` +
      `  ${chalk.cyan("barfi scan ")}\n`,
    {
      padding: 1,
      margin: { top: 0, bottom: 1, left: 2, right: 2 },
      borderStyle: "round",
      borderColor: "cyan",
    }
  )
);

}