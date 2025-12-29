#!/usr/bin/env bash
set -euo pipefail

# [SCRIPT_NAME]: [Brief description of what this script does]
# Usage: ./helper.sh <arg1> [optional-arg2]

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1" >&2
}

# Parse arguments
ARG1="${1:-}"
ARG2="${2:-}"

# Validate required arguments
if [[ -z "$ARG1" ]]; then
  log_error "Missing required argument: <arg1>"
  echo ""
  echo "Usage: $0 <arg1> [optional-arg2]"
  echo ""
  echo "Arguments:"
  echo "  arg1          [Description of arg1]"
  echo "  arg2          [Description of optional arg2]"
  echo ""
  echo "Examples:"
  echo "  $0 example-value"
  echo "  $0 example-value optional-value"
  exit 2
fi

# Main script logic
main() {
  log_info "Starting [SCRIPT_NAME]..."
  log_info "Argument 1: $ARG1"

  if [[ -n "$ARG2" ]]; then
    log_info "Argument 2: $ARG2"
  fi

  # [YOUR_SCRIPT_LOGIC_HERE]
  # Example:

  # Step 1: [Description]
  log_info "Performing step 1..."
  # Your command here
  if [[ $? -eq 0 ]]; then
    log_success "Step 1 completed"
  else
    log_error "Step 1 failed"
    exit 1
  fi

  # Step 2: [Description]
  log_info "Performing step 2..."
  # Your command here
  if [[ $? -eq 0 ]]; then
    log_success "Step 2 completed"
  else
    log_error "Step 2 failed"
    exit 1
  fi

  # Step 3: [Description]
  log_info "Performing step 3..."
  # Your command here
  if [[ $? -eq 0 ]]; then
    log_success "Step 3 completed"
  else
    log_warning "Step 3 had warnings, but continuing..."
  fi

  # Success
  log_success "[SCRIPT_NAME] completed successfully!"

  # Output results
  echo ""
  echo "Results:"
  echo "  - [Result 1]"
  echo "  - [Result 2]"
  echo ""
}

# Error handling
trap 'log_error "Script failed on line $LINENO"' ERR

# Run main function
main

exit 0
