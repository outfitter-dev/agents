#!/usr/bin/env bun

/**
 * {{API_NAME}} API Client
 *
 * Usage: bun run client.ts <command> [options]
 */

const API_BASE = "https://api.example.com/v1";

function getApiKey(): string {
  const key = process.env.{{API_NAME_UPPER}}_API_KEY;
  if (!key) {
    console.error(
      JSON.stringify({
        error: "{{API_NAME_UPPER}}_API_KEY environment variable not set",
        fix: "export {{API_NAME_UPPER}}_API_KEY='your-key'",
      })
    );
    process.exit(1);
  }
  return key;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }

  return response.json() as Promise<T>;
}

// Example operations — replace with actual API endpoints

async function listItems(limit = 10) {
  return apiRequest<{ items: unknown[] }>(`/items?limit=${limit}`);
}

async function getItem(id: string) {
  return apiRequest<{ item: unknown }>(`/items/${id}`);
}

async function createItem(data: Record<string, unknown>) {
  return apiRequest<{ item: unknown }>("/items", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// CLI handler
async function main() {
  const [command, ...args] = process.argv.slice(2);

  try {
    switch (command) {
      case "list": {
        const limit = args[0] ? parseInt(args[0]) : 10;
        const result = await listItems(limit);
        console.log(JSON.stringify(result, null, 2));
        break;
      }
      case "get": {
        if (!args[0]) throw new Error("Usage: get <id>");
        const result = await getItem(args[0]);
        console.log(JSON.stringify(result, null, 2));
        break;
      }
      case "create": {
        if (!args[0]) throw new Error("Usage: create <json-data>");
        const data = JSON.parse(args[0]);
        const result = await createItem(data);
        console.log(JSON.stringify(result, null, 2));
        break;
      }
      default:
        console.log(
          JSON.stringify({
            usage: "client.ts <list|get|create> [args]",
            commands: {
              list: "List items (optional: limit)",
              get: "Get item by ID",
              create: "Create item from JSON",
            },
          })
        );
        process.exit(1);
    }
  } catch (error) {
    console.error(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      })
    );
    process.exit(1);
  }
}

main();
