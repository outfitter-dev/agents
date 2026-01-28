# outfitter-stack

## 1.2.0

### Minor Changes

- Update documentation to match upstream @outfitter/* package changes

#### New Documentation

- **CLI utilities**: Document `parseDateRange`, `formatDuration`, `formatBytes`, `pluralize`, `slugify`, `registerRenderer`
- **File operations reference**: New `references/file-ops.md` with atomic writes, `withSharedLock()` reader-writer locking, secure paths
- **@outfitter/types**: Document collection helpers (`sortBy`, `dedupe`, `chunk`) and type utilities (`Prettify<T>`, `DeepPartial`, `Nullable`)
- **Package tier system**: Document Foundation/Runtime/Tooling tier architecture in stack-architecture skill
- **ERROR_CODES constant**: Document validation constant for error categories

#### Pattern Updates

- **MCP tools**: Update templates to use `defineTool()` helper for better type inference
- **UI merger**: Note that `@outfitter/ui` merged into `@outfitter/cli`

#### Fixes

- Fix incorrect `@outfitter/result` package references to `@outfitter/contracts`

## 1.1.0

### Minor Changes

- d23cdf3: Add outfitter-stack plugin with comprehensive Stack pattern tooling

  - 7 skills: stack-patterns, stack-templates, stack-audit, stack-review, stack-architecture, stack-feedback, stack-debug
  - 1 agent: stacker (skill-aware routing for Stack work)
  - 2 commands: /adopt (phased adoption workflow), /audit (quick compliance check)
  - Rich reference material for all @outfitter/\* packages
