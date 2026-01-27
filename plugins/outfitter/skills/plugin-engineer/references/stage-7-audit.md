# Stage 7: Audit

Validate plugin before distribution.

**Goal**: Ensure plugin quality and completeness.

**Skill**: Delegate by loading `outfitter:claude-plugin-audit`

## Audit Checklist

**Structure**:
- [ ] plugin.json exists and valid
- [ ] Name matches directory
- [ ] Version is semver

**Components**:
- [ ] All skills have SKILL.md
- [ ] All commands have descriptions
- [ ] Hook scripts are executable
- [ ] No broken references

**Documentation**:
- [ ] README.md present
- [ ] Installation instructions work
- [ ] Usage examples accurate

## Severity Levels

| Level | Indicator | Meaning |
|-------|-----------|---------|
| Critical | `◆◆` | Blocks functionality, must fix |
| Warning | `◆` | Best practice violation, should fix |
| Info | `◇` | Suggestion, optional |

## Output

Create `artifacts/plugin-engineer/audit.md` with findings.

## Completion

When audit passes:

1. Plugin is ready for distribution
2. Commit to version control
3. Tag release with semver
4. Push to marketplace or share repo

## Distribution Options

| Method | Best For | Setup |
|--------|----------|-------|
| GitHub repo | Public/team plugins | Push to GitHub |
| Git URL | GitLab, Bitbucket | Full URL in source |
| Local path | Development/testing | Relative path |
