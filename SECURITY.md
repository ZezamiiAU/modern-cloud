# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Modern Cloud seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

### How to Report

1. **Email:** Send details to security@your-domain.com
2. **Include:**
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment:** Within 48 hours
- **Initial Assessment:** Within 5 business days
- **Fix Timeline:** Varies by severity
  - Critical: 1-7 days
  - High: 7-30 days
  - Medium: 30-90 days
  - Low: Best effort

### Disclosure Policy

- Security issues will be fixed before public disclosure
- We will credit reporters (unless anonymity is requested)
- We maintain a security advisory page for disclosed vulnerabilities

## Security Best Practices for Contributors

1. **Never commit secrets** (.env files, API keys, passwords)
2. **Use environment variables** for all sensitive configuration
3. \*\*Run \pnpm audit\*\* before submitting PRs
4. **Keep dependencies updated** regularly
5. **Follow OWASP guidelines** for web security

## Security Features

- ✅ Automated dependency vulnerability scanning (Dependabot)
- ✅ Pre-commit hooks to prevent secret commits
- ✅ Environment variable validation with Zod
- ✅ Type-safe configuration management
- ✅ Separate client/server environment schemas

## Known Security Considerations

### Rate Limiting

Rate limiting middleware provided. Implement at API level as needed.

### Content Security Policy

Security headers middleware available for production deployments.

## Security Contacts

- **Primary:** security@your-domain.com
- **GitHub:** Report via Security Advisories

---

_Last Updated: 2026-01-09_
