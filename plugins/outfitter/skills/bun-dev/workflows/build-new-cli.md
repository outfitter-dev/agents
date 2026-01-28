# Workflow: Build New CLI

Create a Bun CLI tool with argument parsing and subcommands.

<required_reading>

**Read these reference files NOW:**
1. [../../../cli-dev/skills/cli-development/SKILL.md](../../../cli-dev/skills/cli-development/SKILL.md) - CLI patterns and conventions

</required_reading>

<prerequisites>

- Bun installed (`bun --version`)
- CLI requirements understood (commands, flags, output format)
- Target audience defined (developers, end users, etc.)

</prerequisites>

<process>

## Step 1: Initialize Project

```bash
# Create directory
mkdir my-cli && cd my-cli

# Initialize
bun init -y

# Install dependencies (optional, for argument parsing)
bun add commander  # Or use Bun.argv directly
```

## Step 2: Create Entry Point

Create `src/index.ts` with shebang:

```typescript
#!/usr/bin/env bun

const args = Bun.argv.slice(2);  // Remove 'bun' and script path

function printHelp() {
  console.log(`
my-cli - Description of what your CLI does

Usage:
  my-cli <command> [options]

Commands:
  init          Initialize a new project
  build         Build the project
  help          Show this help message

Options:
  -h, --help     Show help
  -v, --version  Show version
  --verbose      Enable verbose output

Examples:
  my-cli init
  my-cli build --verbose
`);
}

function printVersion() {
  const pkg = await Bun.file('./package.json').json();
  console.log(`my-cli v${pkg.version}`);
}

// Main entry
async function main() {
  const command = args[0];

  if (!command || command === 'help' || args.includes('-h') || args.includes('--help')) {
    printHelp();
    process.exit(0);
  }

  if (args.includes('-v') || args.includes('--version')) {
    await printVersion();
    process.exit(0);
  }

  const verbose = args.includes('--verbose');

  switch (command) {
    case 'init':
      await handleInit(verbose);
      break;
    case 'build':
      await handleBuild(verbose);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run "my-cli help" for usage');
      process.exit(1);
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
```

## Step 3: Implement Subcommands

Create `src/commands/init.ts`:

```typescript
export async function handleInit(verbose: boolean) {
  if (verbose) console.log('Initializing project...');

  // Check if already initialized
  const configFile = Bun.file('./config.json');
  if (await configFile.exists()) {
    console.error('Project already initialized');
    process.exit(1);
  }

  // Create config
  await Bun.write('./config.json', JSON.stringify({
    name: 'my-project',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
  }, null, 2));

  console.log('Project initialized successfully');
}
```

Create `src/commands/build.ts`:

```typescript
export async function handleBuild(verbose: boolean) {
  if (verbose) console.log('Starting build...');

  // Check config exists
  const configFile = Bun.file('./config.json');
  if (!(await configFile.exists())) {
    console.error('No config.json found. Run "my-cli init" first.');
    process.exit(1);
  }

  const config = await configFile.json();
  if (verbose) console.log('Config loaded:', config);

  // Build logic here...
  console.log('Build complete');
}
```

## Step 4: Add Structured Argument Parsing (Optional)

For complex CLIs, use a parsing library:

```typescript
#!/usr/bin/env bun

import { Command } from 'commander';

const program = new Command()
  .name('my-cli')
  .description('Description of what your CLI does')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new project')
  .option('-f, --force', 'Overwrite existing config')
  .action(async (options) => {
    await handleInit(options);
  });

program
  .command('build')
  .description('Build the project')
  .option('--verbose', 'Enable verbose output')
  .option('-o, --output <dir>', 'Output directory', './dist')
  .action(async (options) => {
    await handleBuild(options);
  });

program.parse();
```

## Step 5: Build Executable

Update `package.json`:

```json
{
  "name": "my-cli",
  "version": "1.0.0",
  "bin": {
    "my-cli": "./src/index.ts"
  },
  "scripts": {
    "build": "bun build ./src/index.ts --compile --outfile ./dist/my-cli"
  }
}
```

Build the executable:

```bash
# Build for current platform
bun run build

# Or build directly
bun build ./src/index.ts --compile --outfile ./dist/my-cli

# Test the binary
./dist/my-cli --help
./dist/my-cli --version
```

## Step 6: Verify CLI Works

```bash
# Test help
bun run src/index.ts --help
# Expected: Shows help text with commands and options

# Test version
bun run src/index.ts --version
# Expected: Shows version number

# Test init command
bun run src/index.ts init
# Expected: Creates config.json

# Test build command
bun run src/index.ts build --verbose
# Expected: Shows build output with verbose logging

# Test error handling
bun run src/index.ts unknown-command
# Expected: Shows error and help suggestion
```

</process>

<cross_references>

**For CLI best practices:** Load the **cli-dev** skill from `plugins/cli-dev` for:
- Argument parsing conventions
- Help text formatting
- Exit code standards
- Error message patterns

**For shipping:** Continue with [ship-executable.md](./ship-executable.md)

</cross_references>

<anti_patterns>

Avoid:
- Missing shebang (`#!/usr/bin/env bun`)
- Not handling `--help` and `--version` flags
- Using `console.log` for errors (use `console.error`)
- Exiting with 0 on error (use `process.exit(1)`)
- Hardcoding paths (use relative paths or config)
- Ignoring async errors (always `.catch()` or try/catch)

</anti_patterns>

<success_criteria>

This workflow is complete when:
- [ ] `bun run src/index.ts --help` shows usage information
- [ ] `bun run src/index.ts --version` shows version
- [ ] All subcommands execute correctly
- [ ] Errors exit with non-zero code
- [ ] `bun build --compile` produces working executable

</success_criteria>
