import type { ToolCheckResult } from "../types.ts";
import { checkTool } from "../utils.ts";

export async function checkJsonTools(): Promise<ToolCheckResult[]> {
  const tools = [
    {
      name: "jq",
      command: "jq",
      category: "json",
      description: "JSON processor and query language",
      install: {
        brew: "brew install jq",
        apt: "apt install jq",
        url: "https://jqlang.github.io/jq/",
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
