---
"outfitter-stack": minor
---

Update documentation to match upstream @outfitter/* package changes

- Document new CLI utilities: parseDateRange, formatDuration, formatBytes, pluralize, slugify, registerRenderer
- Add file-ops reference with withSharedLock() reader-writer locking pattern
- Document @outfitter/types collection helpers (sortBy, dedupe, chunk) and type utilities
- Add package tier system (Foundation/Runtime/Tooling) to architecture skill
- Update MCP templates to use defineTool() helper
- Note @outfitter/ui merger into @outfitter/cli
- Add ERROR_CODES constant documentation
- Fix incorrect @outfitter/result references to @outfitter/contracts
