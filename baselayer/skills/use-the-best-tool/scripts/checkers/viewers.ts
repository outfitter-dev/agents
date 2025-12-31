import type { ToolCheckResult } from "../types.ts";
import { checkTool } from "../utils.ts";

export async function checkViewerTools(): Promise<ToolCheckResult[]> {
  const tools = [
    {
      name: "bat",
      command: "bat",
      category: "viewers",
      replaces: "cat",
      description: "cat with syntax highlighting and git integration",
      install: {
        brew: "brew install bat",
        cargo: "cargo install bat",
        apt: "apt install bat",
        url: "https://github.com/sharkdp/bat",
      },
    },
    {
      name: "eza",
      command: "eza",
      category: "viewers",
      replaces: "ls",
      description: "Modern ls replacement with colors and icons",
      install: {
        brew: "brew install eza",
        cargo: "cargo install eza",
        apt: "apt install eza",
        url: "https://github.com/eza-community/eza",
      },
    },
    {
      name: "delta",
      command: "delta",
      category: "viewers",
      replaces: "diff",
      description: "Better git diff pager with syntax highlighting",
      install: {
        brew: "brew install git-delta",
        cargo: "cargo install git-delta",
        apt: "apt install git-delta",
        url: "https://github.com/dandavison/delta",
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
