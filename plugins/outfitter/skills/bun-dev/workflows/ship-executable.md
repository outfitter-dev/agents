# Workflow: Ship Executable

Build standalone Bun executables for distribution.

<required_reading>

**Review Bun build options:**
```bash
bun build --help
```

</required_reading>

<prerequisites>

- Working Bun application (CLI or server)
- Target platforms identified
- Dependencies audited (some may not bundle)

</prerequisites>

<process>

## Step 1: Identify Target Platforms

```bash
# Available targets
# bun-linux-x64       Linux x86_64
# bun-linux-arm64     Linux ARM64
# bun-darwin-x64      macOS Intel
# bun-darwin-arm64    macOS Apple Silicon
# bun-windows-x64     Windows x86_64
```

Document your targets in `package.json`:

```json
{
  "scripts": {
    "build": "bun run build:all",
    "build:all": "bun run build:linux && bun run build:macos && bun run build:windows",
    "build:linux": "bun build ./src/index.ts --compile --target=bun-linux-x64 --outfile ./dist/myapp-linux-x64",
    "build:macos": "bun build ./src/index.ts --compile --target=bun-darwin-arm64 --outfile ./dist/myapp-darwin-arm64",
    "build:windows": "bun build ./src/index.ts --compile --target=bun-windows-x64 --outfile ./dist/myapp-windows-x64.exe"
  }
}
```

## Step 2: Configure Build Flags

```bash
# Basic compile
bun build ./src/index.ts --compile --outfile ./dist/myapp

# With minification (smaller binary)
bun build ./src/index.ts --compile --minify --outfile ./dist/myapp

# With source maps (for debugging)
bun build ./src/index.ts --compile --sourcemap --outfile ./dist/myapp

# External dependencies (not bundled)
bun build ./src/index.ts --compile \
  --external better-sqlite3 \
  --outfile ./dist/myapp
```

## Step 3: Handle Embedded Assets

For files that need to be bundled with the executable:

```typescript
// Embed file at compile time
const configTemplate = await Bun.file(import.meta.dir + '/templates/config.json').text();

// Or use import with type assertion
import configTemplate from './templates/config.json' with { type: 'json' };
```

For larger assets, consider:

```typescript
// Check if running as compiled
const isCompiled = !import.meta.file.endsWith('.ts');

// Load assets relative to executable
const assetsDir = isCompiled
  ? import.meta.dir  // Bundled assets
  : './assets';      // Development path
```

## Step 4: Handle Platform Differences

```typescript
// Platform-specific code
const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

// Path separators
import { join } from 'node:path';
const configPath = join(process.env.HOME || process.env.USERPROFILE || '', '.myapp', 'config.json');

// Line endings
const EOL = isWindows ? '\r\n' : '\n';
```

## Step 5: Build for Each Target

```bash
# Create dist directory
mkdir -p dist

# Build for current platform
bun build ./src/index.ts --compile --minify --outfile ./dist/myapp

# Cross-compile for all targets
bun build ./src/index.ts --compile --minify \
  --target=bun-linux-x64 --outfile ./dist/myapp-linux-x64

bun build ./src/index.ts --compile --minify \
  --target=bun-linux-arm64 --outfile ./dist/myapp-linux-arm64

bun build ./src/index.ts --compile --minify \
  --target=bun-darwin-x64 --outfile ./dist/myapp-darwin-x64

bun build ./src/index.ts --compile --minify \
  --target=bun-darwin-arm64 --outfile ./dist/myapp-darwin-arm64

bun build ./src/index.ts --compile --minify \
  --target=bun-windows-x64 --outfile ./dist/myapp-windows-x64.exe

# List built files
ls -lh dist/
```

## Step 6: Test on Clean Machine

```bash
# Test locally (current platform)
./dist/myapp --version
./dist/myapp --help

# For other platforms, use Docker or VM
# Linux testing from macOS:
docker run -v $(pwd)/dist:/app alpine /app/myapp-linux-x64 --version

# Or use GitHub Actions matrix for CI testing
```

## Step 7: Create Release Artifacts

```bash
# Create checksums
cd dist
sha256sum myapp-* > checksums.txt

# Create archives
tar -czvf myapp-linux-x64.tar.gz myapp-linux-x64
tar -czvf myapp-linux-arm64.tar.gz myapp-linux-arm64
tar -czvf myapp-darwin-x64.tar.gz myapp-darwin-x64
tar -czvf myapp-darwin-arm64.tar.gz myapp-darwin-arm64
zip myapp-windows-x64.zip myapp-windows-x64.exe

# List release files
ls -lh *.tar.gz *.zip checksums.txt
```

## Step 8: Document Distribution

Create installation instructions:

```markdown
## Installation

### macOS (Apple Silicon)
curl -L https://github.com/org/repo/releases/latest/download/myapp-darwin-arm64.tar.gz | tar xz
sudo mv myapp-darwin-arm64 /usr/local/bin/myapp

### macOS (Intel)
curl -L https://github.com/org/repo/releases/latest/download/myapp-darwin-x64.tar.gz | tar xz
sudo mv myapp-darwin-x64 /usr/local/bin/myapp

### Linux (x64)
curl -L https://github.com/org/repo/releases/latest/download/myapp-linux-x64.tar.gz | tar xz
sudo mv myapp-linux-x64 /usr/local/bin/myapp

### Windows
Download myapp-windows-x64.zip and extract to PATH
```

</process>

<ci_example>

GitHub Actions workflow for automated releases:

```yaml
name: Release
on:
  push:
    tags: ['v*']

jobs:
  build:
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            target: bun-linux-x64
            artifact: myapp-linux-x64
          - os: ubuntu-latest
            target: bun-linux-arm64
            artifact: myapp-linux-arm64
          - os: macos-latest
            target: bun-darwin-arm64
            artifact: myapp-darwin-arm64
          - os: macos-13
            target: bun-darwin-x64
            artifact: myapp-darwin-x64
          - os: windows-latest
            target: bun-windows-x64
            artifact: myapp-windows-x64.exe

    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2

      - run: bun install
      - run: bun build ./src/index.ts --compile --minify --target=${{ matrix.target }} --outfile ./dist/${{ matrix.artifact }}

      - uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.artifact }}
          path: ./dist/${{ matrix.artifact }}

  release:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
      - run: |
          cd myapp-linux-x64 && sha256sum myapp-linux-x64 >> ../checksums.txt && tar -czvf ../myapp-linux-x64.tar.gz myapp-linux-x64 && cd ..
          # ... repeat for other artifacts
      - uses: softprops/action-gh-release@v2
        with:
          files: |
            *.tar.gz
            *.zip
            checksums.txt
```

</ci_example>

<anti_patterns>

Avoid:
- Not testing on actual target platforms
- Forgetting Windows `.exe` extension
- Bundling secrets or `.env` files
- Assuming file system layout matches dev environment
- Not including version in `--help` output
- Missing checksums for release verification

</anti_patterns>

<success_criteria>

This workflow is complete when:
- [ ] Executable builds for all target platforms
- [ ] `--help` and `--version` work correctly
- [ ] Executable runs on clean machine without Bun installed
- [ ] Platform-specific paths/behaviors handled
- [ ] Release artifacts created with checksums
- [ ] Installation instructions documented

</success_criteria>
