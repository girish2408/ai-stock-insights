#!/bin/bash

# Pre-commit hook to check for secrets
# Install: cp pre-commit-check.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit

echo "🔒 Checking for secrets before commit..."

# Check for .env files
if git diff --cached --name-only | grep -E "\.env$|\.env\.|\.env\."; then
    echo "❌ ERROR: Attempting to commit .env file!"
    echo "Please remove .env files from staging:"
    echo "  git reset HEAD <file>"
    echo "  git rm --cached <file>"
    exit 1
fi

# Check for potential API keys in staged files
if git diff --cached | grep -iE "api.*key.*=.*['\"][^'\"]{10,}|secret.*=.*['\"][^'\"]{10,}|password.*=.*['\"][^'\"]{10,}"; then
    echo "❌ ERROR: Potential hardcoded secrets found in staged files!"
    echo "Please use environment variables instead"
    exit 1
fi

# Check for API key logging
if git diff --cached | grep -iE "console\.(log|error|warn).*api.*key|console\.(log|error|warn).*secret|console\.(log|error|warn).*password"; then
    echo "⚠️  WARNING: Potential secret logging found"
    echo "Please ensure no API keys are logged"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Security check passed"
exit 0

