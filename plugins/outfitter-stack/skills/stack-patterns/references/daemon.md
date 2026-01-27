# Daemon Patterns

Deep dive into @outfitter/daemon patterns.

## Creating a Daemon

```typescript
import {
  createDaemon,
  getLockPath,
} from "@outfitter/daemon";
import { createLogger, createConsoleSink } from "@outfitter/logging";

const logger = createLogger({
  name: "my-daemon",
  level: "info",
  sinks: [createConsoleSink()],
});

const daemon = createDaemon({
  name: "my-daemon",
  pidFile: getLockPath("my-daemon"),
  logger,
  shutdownTimeout: 10000,  // 10s graceful shutdown
});
```

## Lifecycle Hooks

```typescript
// Called before start
daemon.onBeforeStart(async () => {
  logger.info("Preparing to start...");
  await initializeDatabase();
});

// Called after start
daemon.onAfterStart(async () => {
  logger.info("Daemon started successfully");
});

// Called on shutdown (SIGTERM, SIGINT)
daemon.onShutdown(async () => {
  logger.info("Shutting down...");
  await closeConnections();
  await flushBuffers();
});

// Start the daemon
const result = await daemon.start();
if (result.isErr()) {
  logger.error("Failed to start", { error: result.error });
  process.exit(1);
}
```

## IPC Server

### Setting Up IPC

```typescript
import {
  createIpcServer,
  getSocketPath,
} from "@outfitter/daemon";

const ipcServer = createIpcServer(getSocketPath("my-daemon"));

// Handle messages
ipcServer.onMessage(async (msg) => {
  const message = msg as { type: string; payload?: unknown };

  switch (message.type) {
    case "status":
      return {
        status: "ok",
        uptime: process.uptime(),
        version: "1.0.0",
      };

    case "reload":
      await reloadConfig();
      return { success: true };

    case "metrics":
      return getMetrics();

    default:
      return { error: "Unknown command" };
  }
});

// Register cleanup
daemon.onShutdown(async () => {
  await ipcServer.close();
});

// Start listening
await ipcServer.listen();
logger.info("IPC listening", { socket: getSocketPath("my-daemon") });
```

### IPC Client

```typescript
import {
  createIpcClient,
  getSocketPath,
} from "@outfitter/daemon";

const client = createIpcClient(getSocketPath("my-daemon"));

await client.connect();

// Send message and get response
const status = await client.send<{
  status: string;
  uptime: number;
}>({ type: "status" });

console.log("Daemon status:", status);

// Clean up
client.close();
```

## Health Checks

### Defining Checks

```typescript
import { createHealthChecker } from "@outfitter/daemon";
import { Result } from "@outfitter/contracts";

const healthChecker = createHealthChecker([
  {
    name: "memory",
    check: async () => {
      const used = process.memoryUsage().heapUsed / 1024 / 1024;
      return used < 500
        ? Result.ok(undefined)
        : Result.err(new Error(`High memory: ${used.toFixed(2)}MB`));
    },
  },
  {
    name: "database",
    check: async () => {
      try {
        await db.ping();
        return Result.ok(undefined);
      } catch (error) {
        return Result.err(new Error("Database unreachable"));
      }
    },
  },
  {
    name: "disk",
    check: async () => {
      const free = await getDiskSpace();
      return free > 100 * 1024 * 1024  // 100MB
        ? Result.ok(undefined)
        : Result.err(new Error("Low disk space"));
    },
  },
]);
```

### Exposing Health via IPC

```typescript
ipcServer.onMessage(async (msg) => {
  if (msg.type === "health") {
    const result = await healthChecker.check();
    return {
      healthy: result.isOk(),
      checks: result.isOk() ? result.value : result.error,
    };
  }
});
```

### Periodic Health Checks

```typescript
const HEALTH_INTERVAL = 30000;  // 30 seconds

setInterval(async () => {
  const result = await healthChecker.check();

  if (result.isErr()) {
    logger.warn("Health check failed", { checks: result.error });
  }
}, HEALTH_INTERVAL);
```

## PID File Management

### XDG Paths

```typescript
import { getLockPath, getSocketPath, getLogPath } from "@outfitter/daemon";

// PID file: ~/.local/state/my-daemon/my-daemon.pid
const pidPath = getLockPath("my-daemon");

// Socket: ~/.local/state/my-daemon/my-daemon.sock
const socketPath = getSocketPath("my-daemon");

// Logs: ~/.local/state/my-daemon/logs/
const logDir = getLogPath("my-daemon");
```

### Checking if Running

```typescript
import { isDaemonRunning, getDaemonPid } from "@outfitter/daemon";

if (await isDaemonRunning("my-daemon")) {
  const pid = await getDaemonPid("my-daemon");
  console.log(`Daemon already running (PID: ${pid})`);
  process.exit(1);
}
```

## CLI Integration

### Start Command

```typescript
export const startCommand = command("start")
  .option("-d, --detach", "Run in background")
  .action(async ({ flags }) => {
    if (await isDaemonRunning("my-daemon")) {
      console.log("Daemon already running");
      return;
    }

    if (flags.detach) {
      // Spawn detached process
      spawn("bun", ["run", "src/daemon.ts"], {
        detached: true,
        stdio: "ignore",
      }).unref();
      console.log("Daemon started in background");
    } else {
      // Run in foreground
      await runDaemon();
    }
  })
  .build();
```

### Stop Command

```typescript
export const stopCommand = command("stop")
  .action(async () => {
    const client = createIpcClient(getSocketPath("my-daemon"));

    try {
      await client.connect();
      await client.send({ type: "shutdown" });
      console.log("Daemon stopped");
    } catch {
      console.log("Daemon not running");
    } finally {
      client.close();
    }
  })
  .build();
```

### Status Command

```typescript
export const statusCommand = command("status")
  .action(async () => {
    const client = createIpcClient(getSocketPath("my-daemon"));

    try {
      await client.connect();
      const status = await client.send<Status>({ type: "status" });
      console.log("Status:", status);
    } catch {
      console.log("Daemon not running");
    } finally {
      client.close();
    }
  })
  .build();
```

## Best Practices

1. **Graceful shutdown** - Register cleanup handlers with `onShutdown`
2. **Health checks** - Monitor critical dependencies
3. **IPC protocol** - Use structured message types
4. **PID files** - Use XDG paths for consistency
5. **Logging** - Log lifecycle events for debugging
6. **CLI commands** - Provide start/stop/status commands
