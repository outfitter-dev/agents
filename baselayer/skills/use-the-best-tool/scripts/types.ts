export interface ToolCheckResult {
  name: string;
  command: string;
  category: string;
  available: boolean;
  version?: string;
  replaces?: string;
  description: string;
  install: {
    brew?: string;
    cargo?: string;
    apt?: string;
    url: string;
  };
}

export type Category = "search" | "json" | "viewers" | "navigation" | "http";
export type OutputFormat = "json" | "text";
