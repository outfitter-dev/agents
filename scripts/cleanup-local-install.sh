#!/bin/bash
# Cleanup script to remove all local outfitter plugin installations
# Run this BEFORE reinstalling from GitHub
#
# Usage: bash scripts/cleanup-local-install.sh
#
# What this does:
# 1. Removes cached plugin files
# 2. Removes entries from installed_plugins.json
# 3. Removes entries from known_marketplaces.json
# 4. Removes entries from settings.json enabledPlugins

set -e

CLAUDE_DIR="$HOME/.claude"
PLUGINS_DIR="$CLAUDE_DIR/plugins"

echo "=== Outfitter Plugin Cleanup ==="
echo ""

# 1. Remove cache directories
echo "1. Removing cache directories..."
if [ -d "$PLUGINS_DIR/cache/outfitter" ]; then
    rm -rf "$PLUGINS_DIR/cache/outfitter"
    echo "   ✓ Removed $PLUGINS_DIR/cache/outfitter"
else
    echo "   - $PLUGINS_DIR/cache/outfitter (not found)"
fi

if [ -d "$PLUGINS_DIR/cache/outfitter-internal" ]; then
    rm -rf "$PLUGINS_DIR/cache/outfitter-internal"
    echo "   ✓ Removed $PLUGINS_DIR/cache/outfitter-internal"
else
    echo "   - $PLUGINS_DIR/cache/outfitter-internal (not found)"
fi

# 2. Remove from installed_plugins.json
echo ""
echo "2. Cleaning installed_plugins.json..."
INSTALLED_FILE="$PLUGINS_DIR/installed_plugins.json"
if [ -f "$INSTALLED_FILE" ]; then
    # Create backup
    cp "$INSTALLED_FILE" "$INSTALLED_FILE.bak"

    # Remove all outfitter-related entries
    jq 'del(.plugins["but@outfitter"]) |
        del(.plugins["claude-dev@outfitter"]) |
        del(.plugins["cli-dev@outfitter"]) |
        del(.plugins["gt@outfitter"]) |
        del(.plugins["outfitter@outfitter"]) |
        del(.plugins["outfitter-dev@outfitter-internal"])' \
        "$INSTALLED_FILE.bak" > "$INSTALLED_FILE"

    echo "   ✓ Removed outfitter entries from installed_plugins.json"
    echo "   ✓ Backup saved to installed_plugins.json.bak"
fi

# 3. Remove from known_marketplaces.json
echo ""
echo "3. Cleaning known_marketplaces.json..."
MARKETPLACES_FILE="$PLUGINS_DIR/known_marketplaces.json"
if [ -f "$MARKETPLACES_FILE" ]; then
    # Create backup
    cp "$MARKETPLACES_FILE" "$MARKETPLACES_FILE.bak"

    # Remove outfitter marketplace entry
    jq 'del(.outfitter) | del(.["outfitter-internal"])' \
        "$MARKETPLACES_FILE.bak" > "$MARKETPLACES_FILE"

    echo "   ✓ Removed outfitter from known_marketplaces.json"
    echo "   ✓ Backup saved to known_marketplaces.json.bak"
fi

# 4. Remove from settings.json enabledPlugins
echo ""
echo "4. Cleaning settings.json..."
SETTINGS_FILE="$CLAUDE_DIR/settings.json"
if [ -f "$SETTINGS_FILE" ]; then
    # Create backup
    cp "$SETTINGS_FILE" "$SETTINGS_FILE.bak"

    # Remove outfitter entries from enabledPlugins
    jq 'del(.enabledPlugins["outfitter@outfitter"]) |
        del(.enabledPlugins["outfitter-dev@outfitter-internal"]) |
        del(.enabledPlugins["but@outfitter"]) |
        del(.enabledPlugins["gt@outfitter"]) |
        del(.enabledPlugins["cli-dev@outfitter"]) |
        del(.enabledPlugins["claude-dev@outfitter"])' \
        "$SETTINGS_FILE.bak" > "$SETTINGS_FILE"

    echo "   ✓ Removed outfitter entries from settings.json"
    echo "   ✓ Backup saved to settings.json.bak"
fi

echo ""
echo "=== Cleanup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Commit and push the version bump to GitHub"
echo "  2. Run: /plugin marketplace add outfitter-dev/agents"
echo "  3. Run: /plugin install outfitter@outfitter"
echo "  4. Run: /plugin install gt@outfitter"
echo "  5. Run: /plugin install but@outfitter"
echo "  6. Run: /plugin install cli-dev@outfitter"
echo ""
echo "To restore from backups if needed:"
echo "  cp $INSTALLED_FILE.bak $INSTALLED_FILE"
echo "  cp $MARKETPLACES_FILE.bak $MARKETPLACES_FILE"
echo "  cp $SETTINGS_FILE.bak $SETTINGS_FILE"
