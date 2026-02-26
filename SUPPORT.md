# Support & Documentation

## 📖 Documentation

Complete documentation is available at:

- **MCP Docs Page:** https://fiberagent.shop/docs/mcp
- **Full Integration Guide:** https://github.com/openclawlaurent/FiberAgent/blob/main/MCP_INTEGRATION_GUIDE.md (13KB)
- **Quick Start Guide:** https://github.com/openclawlaurent/FiberAgent/blob/main/MCP_QUICKSTART.md (5 min setup)
- **Developer Portal:** https://fiberagent.shop/developers (OpenAPI, endpoints, examples)

## 🐛 Recommended Support Channel

**Primary:** [GitHub Issues](https://github.com/openclawlaurent/FiberAgent/issues)

### How to Report Issues

1. Open a new issue on GitHub
2. Include:
   - **Title:** Clear problem description
   - **MCP method:** Which tool/function failed (e.g., `search_products`)
   - **Request body:** The exact JSON-RPC request you sent
   - **Response:** The error response you received
   - **Environment:** Claude Desktop version, OS, or your integration method (curl, Python, etc.)

**Example issue title:**
```
search_products returns missing_wallet error even with wallet_address provided
```

## 💬 Alternative Channels

- **Discussions:** [GitHub Discussions](https://github.com/openclawlaurent/FiberAgent/discussions) for general questions
- **Pull Requests:** [GitHub PRs](https://github.com/openclawlaurent/FiberAgent/pulls) for contributions/fixes

## ⏱️ Response Times (SLA)

| Issue Type | Response Time |
|-----------|---------------|
| Bug reports (MCP server down/broken) | 24 hours |
| Integration help | 24-48 hours |
| Feature requests | Weekly review |
| General questions | Best effort |

## FAQ

**Q: Can I use FiberAgent without Claude Desktop?**
A: Yes! The MCP server is a standard HTTP endpoint. Use cURL, Python, Node.js, or any HTTP client. See examples in the [Quick Start Guide](https://github.com/openclawlaurent/FiberAgent/blob/main/MCP_QUICKSTART.md).

**Q: Do I need API keys or authentication?**
A: No. The endpoint is public and requires no credentials.

**Q: What if the endpoint is down?**
A: Check [GitHub Issues](https://github.com/openclawlaurent/FiberAgent/issues) or open a new issue. We monitor uptime 24/7.

**Q: How do I report a security issue?**
A: Please do NOT open a public issue. Contact the maintainers privately through GitHub (use Security Advisory feature if available).

**Q: Can I self-host the MCP server?**
A: Yes! The source code is on GitHub. Clone, modify, deploy. See [README](https://github.com/openclawlaurent/FiberAgent#readme).

## Status & Monitoring

- **Live Endpoint:** https://fiberagent.shop/api/mcp
- **Status Page:** Coming soon
- **GitHub Status:** Open issues on [GitHub](https://github.com/openclawlaurent/FiberAgent/issues)

## Contributing

Found a bug? Have an improvement? Contributions welcome!

1. Fork the repo
2. Create a branch (`git checkout -b fix/issue-name`)
3. Make your changes
4. Open a PR

See [GitHub](https://github.com/openclawlaurent/FiberAgent) for details.

---

**Last updated:** Feb 26, 2026
