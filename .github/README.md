# GitHub Repository Security

This directory contains GitHub-specific security configurations.

## GitHub Actions

- **`check-secrets.yml`**: Automatically checks for secrets in commits and pull requests

## Security Features

1. **Pre-commit checks**: See `pre-commit-check.sh` in the root directory
2. **GitHub Actions**: Automatic secret scanning on push/PR
3. **`.gitignore`**: Comprehensive ignore patterns for sensitive files
4. **`.gitattributes`**: Additional protection for sensitive files

## Setting Up Pre-commit Hook

To enable the pre-commit security check:

```bash
cp pre-commit-check.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

This will automatically check for secrets before each commit.

