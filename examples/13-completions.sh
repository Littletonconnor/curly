#!/bin/bash
# =============================================================================
# 13-completions.sh - Shell Completions
# =============================================================================
# Demonstrates: --completions flag for bash/zsh tab completion
# =============================================================================

echo "=============================================="
echo "  CURLY EXAMPLES: Shell Completions"
echo "=============================================="
echo ""

# -----------------------------------------------------------------------------
# Overview
# -----------------------------------------------------------------------------

echo "SHELL COMPLETIONS OVERVIEW"
echo "--------------------------"
echo ""
echo "Shell completions enable tab-completion for curly commands."
echo "Type 'curly -' and press TAB to see available flags."
echo ""
echo ""

# -----------------------------------------------------------------------------
# Generate Bash Completions
# -----------------------------------------------------------------------------

echo "1. Generate Bash completion script"
echo "   Command: curly --completions bash"
echo "   ---"
curly --completions bash
echo ""
echo ""

# -----------------------------------------------------------------------------
# Generate Zsh Completions
# -----------------------------------------------------------------------------

echo "2. Generate Zsh completion script"
echo "   Command: curly --completions zsh"
echo "   ---"
curly --completions zsh
echo ""
echo ""

# -----------------------------------------------------------------------------
# Install Completions
# -----------------------------------------------------------------------------

echo "3. Auto-install completions (detects shell)"
echo "   Command: curly --completions install"
echo "   Note: This modifies your ~/.bashrc or ~/.zshrc"
echo "   ---"
echo "   (Skipped - would modify shell config)"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Manual Installation
# -----------------------------------------------------------------------------

echo "MANUAL INSTALLATION"
echo "-------------------"
echo ""
echo "For Bash:"
echo "  1. Run: curly --completions bash >> ~/.bashrc"
echo "  2. Or save to file: curly --completions bash > /etc/bash_completion.d/curly"
echo "  3. Restart shell or run: source ~/.bashrc"
echo ""
echo "For Zsh:"
echo "  1. Run: curly --completions zsh >> ~/.zshrc"
echo "  2. Restart shell or run: source ~/.zshrc"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Using Completions
# -----------------------------------------------------------------------------

echo "USING COMPLETIONS"
echo "-----------------"
echo ""
echo "Once installed, you can use TAB to:"
echo ""
echo "  Complete flags:"
echo "    curly --he<TAB>  ->  curly --headers"
echo "    curly -<TAB>     ->  shows all short flags"
echo ""
echo "  Complete long options:"
echo "    curly --data<TAB>  ->  curly --data-raw (if unambiguous)"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------

echo "=============================================="
echo "  Summary: Shell Completions"
echo "=============================================="
echo ""
echo "  Generate Completions:"
echo "    --completions bash     Output bash completion script"
echo "    --completions zsh      Output zsh completion script"
echo "    --completions install  Auto-install for current shell"
echo ""
echo "  Supported Shells:"
echo "    - Bash (most common on Linux)"
echo "    - Zsh (default on macOS)"
echo ""
echo "  After Installation:"
echo "    - Restart your terminal, or"
echo "    - Run: source ~/.bashrc (or ~/.zshrc)"
echo ""
