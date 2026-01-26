import type { ToolCheckResult } from "../types.ts";
import { checkTool } from "../utils.ts";

export async function checkSearchTools(): Promise<ToolCheckResult[]> {
  const tools = [
    {
      name: "fd",
      command: "fd",
      category: "search",
      replaces: "find",
      description: "Fast file finder",
      install: {
        brew: "brew install fd",
        cargo: "cargo install fd-find",
        apt: "apt install fd-find",
        url: "https://github.com/sharkdp/fd",
      },
    },
    {
      name: "ripgrep",
      command: "rg",
      category: "search",
      replaces: "grep",
      description: "Fast code search",
      install: {
        brew: "brew install ripgrep",
        cargo: "cargo install ripgrep",
        apt: "apt install ripgrep",
        url: "https://github.com/BurntSushi/ripgrep",
      },
    },
    {
      name: "ast-grep",
      command: "sg",
      category: "search",
      description: "AST-aware code search and refactoring",
      install: {
        brew: "brew install ast-grep",
        cargo: "cargo install ast-grep",
        apt: "npm install -g @ast-grep/cli",
        url: "https://github.com/ast-grep/ast-grep",
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
