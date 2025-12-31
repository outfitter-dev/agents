import type { ToolCheckResult } from "../types.ts";
import { checkTool } from "../utils.ts";

export async function checkNavigationTools(): Promise<ToolCheckResult[]> {
  const tools = [
    {
      name: "zoxide",
      command: "z",
      category: "navigation",
      replaces: "cd",
      description: "Smart directory jumper that learns your habits",
      install: {
        brew: "brew install zoxide",
        cargo: "cargo install zoxide",
        apt: "apt install zoxide",
        url: "https://github.com/ajeetdsouza/zoxide",
      },
    },
    {
      name: "fzf",
      command: "fzf",
      category: "navigation",
      description: "Fuzzy finder for files, commands, and more",
      install: {
        brew: "brew install fzf",
        apt: "apt install fzf",
        url: "https://github.com/junegunn/fzf",
      },
    },
  ] as const;

  const results = await Promise.all(
    tools.map(async (tool) => {
      const { available, version } = await checkTool(tool.command);
      return {
        ...tool,
        available,
        version,
      };
    }),
  );

  return results;
}
