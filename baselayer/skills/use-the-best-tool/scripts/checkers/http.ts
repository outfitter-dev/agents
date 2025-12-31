import type { ToolCheckResult } from "../types.ts";
import { checkTool } from "../utils.ts";

export async function checkHttpTools(): Promise<ToolCheckResult[]> {
  const tools = [
    {
      name: "httpie",
      command: "http",
      category: "http",
      replaces: "curl",
      description: "Human-friendly HTTP client for testing APIs",
      install: {
        brew: "brew install httpie",
        apt: "apt install httpie",
        url: "https://httpie.io/",
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
