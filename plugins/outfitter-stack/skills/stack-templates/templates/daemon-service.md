# Daemon Service Template

Background service with lifecycle management, IPC, and health checks.

## Template

```typescript
import {
  createDaemon,
  createIpcServer,
  createHealthChecker,
  getSocketPath,
  getLockPath,
  getLogPath,
} from "@outfitter/daemon";
import { createLogger, createConsoleSink, createFileSink } from "@outfitter/logging";
import { Result } from "@outfitter/contracts";

// ============================================================================
// Configuration
// ============================================================================

const DAEMON_NAME = "my-daemon";
const SHUTDOWN_TIMEOUT = 10000; // 10 seconds
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

// ============================================================================
// Logger Setup
// ============================================================================

const logger = createLogger({
  name: DAEMON_NAME,
  level: process.env.LOG_LEVEL || "info",
  sinks: [
    createConsoleSink({ colorize: true }),
    createFileSink({
      path: `${getLogPath(DAEMON_NAME)}/daemon.log`,
      maxSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  ],
  redaction: { enabled: true },
});

// ============================================================================
// Daemon Setup
// ============================================================================

const daemon = createDaemon({
  name: DAEMON_NAME,
  pidFile: getLockPath(DAEMON_NAME),
  logger,
  shutdownTimeout: SHUTDOWN_TIMEOUT,
});

// ============================================================================
// Health Checks
// ============================================================================

const healthChecker = createHealthChecker([
  {
    name: "memory",
    check: async () => {
      const used = process.memoryUsage().heapUsed / 1024 / 1024;
      const threshold = 500; // MB
      return used < threshold
        ? Result.ok(undefined)
        : Result.err(new Error(`High memory usage: ${used.toFixed(2)}MB`));
    },
  },
  {
    name: "uptime",
    check: async () => {
      // Always healthy, just reports uptime
      return Result.ok(undefined);
    },
  },
  // Add more checks as needed:
  // - Database connectivity
  // - External API availability
  // - Disk space
  // - Queue depth
]);

// ============================================================================
// IPC Server
// ============================================================================

const ipcServer = createIpcServer(getSocketPath(DAEMON_NAME));

interface IpcMessage {
  type: string;
  payload?: unknown;
}

interface StatusResponse {
  status: "ok" | "degraded" | "error";
  uptime: number;
  version: string;
  pid: number;
}

interface HealthResponse {
  healthy: boolean;
  checks: Record<string, { ok: boolean; error?: string }>;
}

ipcServer.onMessage(async (msg): Promise<unknown> => {
  const message = msg as IpcMessage;

  switch (message.type) {
    case "status":
      return {
        status: "ok",
        uptime: process.uptime(),
        version: "1.0.0",
        pid: process.pid,
      } satisfies StatusResponse;

    case "health": {
      const result = await healthChecker.check();
      return {
        healthy: result.isOk(),
        checks: result.isOk() ? result.value : result.error,
      } satisfies HealthResponse;
    }

    case "reload":
      logger.info("Reloading configuration");
      await reloadConfiguration();
      return { success: true };

    case "shutdown":
      logger.info("Shutdown requested via IPC");
      process.kill(process.pid, "SIGTERM");
      return { success: true };

    default:
      return { error: `Unknown command: ${message.type}` };
  }
});

// ============================================================================
// Lifecycle Hooks
// ============================================================================

daemon.onBeforeStart(async () => {
  logger.info("Preparing to start daemon");
  await initializeResources();
});

daemon.onAfterStart(async () => {
  logger.info("Daemon started successfully", {
    pid: process.pid,
    socket: getSocketPath(DAEMON_NAME),
  });

  // Start periodic health checks
  setInterval(async () => {
    const result = await healthChecker.check();
    if (result.isErr()) {
      logger.warn("Health check failed", { checks: result.error });
    }
  }, HEALTH_CHECK_INTERVAL);
});

daemon.onShutdown(async () => {
  logger.info("Shutting down daemon");

  // Close IPC server
  await ipcServer.close();

  // Cleanup resources
  await cleanupResources();

  logger.info("Daemon shutdown complete");
});

// ============================================================================
// Main Entry Point
// ============================================================================

async function main() {
  // Start daemon (handles PID file, signals)
  const startResult = await daemon.start();
  if (startResult.isErr()) {
    logger.error("Failed to start daemon", { error: startResult.error });
    process.exit(1);
  }

  // Start IPC server
  await ipcServer.listen();
  logger.info("IPC server listening", { socket: getSocketPath(DAEMON_NAME) });

  // Start main work loop
  await runMainLoop();
}

// ============================================================================
// Application Logic
// ============================================================================

async function initializeResources(): Promise<void> {
  // Initialize database connections, caches, etc.
}

async function cleanupResources(): Promise<void> {
  // Close connections, flush buffers, etc.
}

async function reloadConfiguration(): Promise<void> {
  // Reload configuration without restart
}

async function runMainLoop(): Promise<void> {
  // Main daemon work loop
  while (!daemon.isShuttingDown) {
    // Do work
    await processNextItem();
    await Bun.sleep(1000);
  }
}

async function processNextItem(): Promise<void> {
  // Process one unit of work
}

// ============================================================================
// Start
// ============================================================================

main().catch((error) => {
  logger.fatal("Unhandled error", { error });
  process.exit(1);
});
```

## CLI Commands

```typescript
import { command } from "@outfitter/cli";
import {
  createIpcClient,
  getSocketPath,
  isDaemonRunning,
} from "@outfitter/daemon";
import { spawn } from "child_process";

const DAEMON_NAME = "my-daemon";

// Start command
export const startCommand = command("start")
  .description("Start the daemon")
  .option("-d, --detach", "Run in background")
  .action(async ({ flags }) => {
    if (await isDaemonRunning(DAEMON_NAME)) {
      console.log("Daemon is already running");
      return;
    }

    if (flags.detach) {
      spawn("bun", ["run", "src/daemon.ts"], {
        detached: true,
        stdio: "ignore",
      }).unref();
      console.log("Daemon started in background");
    } else {
      // Import and run directly
      await import("./daemon.js");
    }
  })
  .build();

// Stop command
export const stopCommand = command("stop")
  .description("Stop the daemon")
  .action(async () => {
    const client = createIpcClient(getSocketPath(DAEMON_NAME));

    try {
      await client.connect();
      await client.send({ type: "shutdown" });
      console.log("Daemon stopping");
    } catch {
      console.log("Daemon is not running");
    } finally {
      client.close();
    }
  })
  .build();

// Status command
export const statusCommand = command("status")
  .description("Check daemon status")
  .action(async () => {
    const client = createIpcClient(getSocketPath(DAEMON_NAME));

    try {
      await client.connect();
      const status = await client.send<{
        status: string;
        uptime: number;
        pid: number;
      }>({ type: "status" });

      console.log(`Status: ${status.status}`);
      console.log(`PID: ${status.pid}`);
      console.log(`Uptime: ${Math.floor(status.uptime)}s`);
    } catch {
      console.log("Daemon is not running");
    } finally {
      client.close();
    }
  })
  .build();

// Health command
export const healthCommand = command("health")
  .description("Check daemon health")
  .action(async () => {
    const client = createIpcClient(getSocketPath(DAEMON_NAME));

    try {
      await client.connect();
      const health = await client.send<{
        healthy: boolean;
        checks: Record<string, { ok: boolean; error?: string }>;
      }>({ type: "health" });

      console.log(`Healthy: ${health.healthy}`);
      for (const [name, check] of Object.entries(health.checks)) {
        const status = check.ok ? "✓" : "✗";
        const message = check.error ? ` (${check.error})` : "";
        console.log(`  ${status} ${name}${message}`);
      }
    } catch {
      console.log("Daemon is not running");
    } finally {
      client.close();
    }
  })
  .build();
```

## Checklist

- [ ] Graceful shutdown with `onShutdown` hook
- [ ] PID file in XDG state directory
- [ ] IPC socket for control commands
- [ ] Health checks for critical dependencies
- [ ] Structured logging with redaction
- [ ] CLI commands for start/stop/status/health

## XDG Paths

| Function | Path | Example |
|----------|------|---------|
| `getLockPath(name)` | `~/.local/state/{name}/{name}.pid` | `~/.local/state/my-daemon/my-daemon.pid` |
| `getSocketPath(name)` | `~/.local/state/{name}/{name}.sock` | `~/.local/state/my-daemon/my-daemon.sock` |
| `getLogPath(name)` | `~/.local/state/{name}/logs/` | `~/.local/state/my-daemon/logs/` |
