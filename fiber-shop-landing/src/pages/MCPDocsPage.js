import React from 'react';
import { motion } from 'framer-motion';
import './MCPDocsPage.css';

export default function MCPDocsPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="mcp-docs-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.section className="mcp-hero" variants={itemVariants}>
        <div className="hero-content">
          <h1>🔌 MCP Server Documentation</h1>
          <p>Model Context Protocol integration for AI shopping assistants</p>
          <div className="hero-badges">
            <span className="badge live">🟢 Live</span>
            <span className="badge production">Production Ready</span>
          </div>
        </div>
      </motion.section>

      {/* Quick Links */}
      <motion.section className="quick-links" variants={itemVariants}>
        <div className="links-grid">
          <a href="#endpoint" className="link-card">
            <span className="icon">⚡</span>
            <h3>Live Endpoint</h3>
            <p>https://fiberagent.shop/api/mcp</p>
          </a>
          <a href="#quickstart" className="link-card">
            <span className="icon">🚀</span>
            <h3>Quick Start</h3>
            <p>Get running in 3 minutes</p>
          </a>
          <a href="#tools" className="link-card">
            <span className="icon">🛠️</span>
            <h3>Available Tools</h3>
            <p>4 search & analytics tools</p>
          </a>
          <a href="#examples" className="link-card">
            <span className="icon">💻</span>
            <h3>Code Examples</h3>
            <p>cURL, Python, JavaScript</p>
          </a>
        </div>
      </motion.section>

      {/* What is MCP */}
      <motion.section className="doc-section what-is-mcp" variants={itemVariants} id="what-is-mcp">
        <h2>What is MCP?</h2>
        <p>
          <strong>Model Context Protocol (MCP)</strong> is an open standard for connecting AI models to external tools and data sources. FiberAgent exposes a complete shopping assistant MCP server that lets Claude (or any MCP-compatible AI) search products, compare cashback rates, and track earnings across 50,000+ merchants.
        </p>
        <div className="highlight-box">
          <p>✨ <strong>No API keys needed.</strong> Direct HTTP POST to <code>/api/mcp</code> with JSON-RPC messages.</p>
        </div>
      </motion.section>

      {/* Endpoint Info */}
      <motion.section className="doc-section endpoint-info" variants={itemVariants} id="endpoint">
        <h2>Live MCP Endpoint</h2>
        <div className="endpoint-box">
          <p><strong>Base URL:</strong></p>
          <code className="code-block">https://fiberagent.shop/api/mcp</code>
          <p style={{ marginTop: '1rem' }}><strong>Protocol:</strong> JSON-RPC 2.0 over HTTP POST</p>
          <p><strong>Rate Limits:</strong> 100 req/min, 1000 req/hr, 5000 req/day per agent</p>
        </div>
      </motion.section>

      {/* Quick Start */}
      <motion.section className="doc-section quickstart" variants={itemVariants} id="quickstart">
        <h2>Quick Start (3 Minutes)</h2>
        
        <h3>Option 1: cURL (Instant Test)</h3>
        <pre className="code-block"><code>{`curl -X POST https://fiberagent.shop/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "search_products",
      "arguments": {
        "keywords": "running shoes",
        "wallet_address": "0x...",
        "preferred_token": "MON",
        "max_results": 5
      }
    }
  }'`}</code></pre>

        <h3>Option 2: Claude Desktop Config</h3>
        <p>Add to <code>~/Library/Application Support/Claude/claude_desktop_config.json</code>:</p>
        <pre className="code-block"><code>{`{
  "mcpServers": {
    "fiberagent": {
      "url": "https://fiberagent.shop/api/mcp"
    }
  }
}`}</code></pre>
        <p style={{ marginTop: '1rem' }}>Restart Claude Desktop. FiberAgent tools appear automatically.</p>

        <h3>Option 3: Python</h3>
        <pre className="code-block"><code>{`import requests
import json

response = requests.post(
    'https://fiberagent.shop/api/mcp',
    headers={'Content-Type': 'application/json'},
    json={
        'jsonrpc': '2.0',
        'id': 1,
        'method': 'tools/call',
        'params': {
            'name': 'search_products',
            'arguments': {
                'keywords': 'running shoes',
                'wallet_address': '0x...',
                'preferred_token': 'MON'
            }
        }
    }
)

print(json.dumps(response.json(), indent=2))`}</code></pre>

        <h3>Option 4: Node.js</h3>
        <pre className="code-block"><code>{`const response = await fetch('https://fiberagent.shop/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'search_products',
      arguments: {
        keywords: 'running shoes',
        wallet_address: '0x...',
        preferred_token: 'MON'
      }
    }
  })
});

const data = await response.json();
console.log(data);`}</code></pre>
      </motion.section>

      {/* Available Tools */}
      <motion.section className="doc-section tools" variants={itemVariants} id="tools">
        <h2>Available Tools</h2>
        
        <div className="tools-grid">
          <div className="tool-card">
            <h3>🔍 search_products</h3>
            <p><strong>Search products across 50,000+ merchants with real-time cashback.</strong></p>
            <p><code>keywords</code> (required), <code>wallet_address</code>, <code>preferred_token</code> (MON/BONK/USDC), <code>max_results</code></p>
            <p className="return-type"><strong>Returns:</strong> Markdown table with product details, prices, cashback rates, affiliate links</p>
          </div>

          <div className="tool-card">
            <h3>💬 search_by_intent</h3>
            <p><strong>Natural language shopping — describe what you want.</strong></p>
            <p><code>intent</code> (required), <code>wallet_address</code>, <code>preferred_token</code>, <code>preferences</code> (array)</p>
            <p className="return-type"><strong>Returns:</strong> Parsed results matching intent + filters (price, cashback, etc.)</p>
          </div>

          <div className="tool-card">
            <h3>💰 compare_cashback</h3>
            <p><strong>Compare the same product across merchants for best cashback.</strong></p>
            <p><code>product_query</code> (required), <code>wallet_address</code>, <code>preferred_token</code></p>
            <p className="return-type"><strong>Returns:</strong> Ranked comparison table (highest cashback first)</p>
          </div>

          <div className="tool-card">
            <h3>📊 get_agent_stats</h3>
            <p><strong>Check your agent earnings, pending cashback, and performance.</strong></p>
            <p><code>agent_id</code> (optional)</p>
            <p className="return-type"><strong>Returns:</strong> Earnings dashboard (searches, pending/confirmed earnings)</p>
          </div>
        </div>
      </motion.section>

      {/* Key Features */}
      <motion.section className="doc-section features" variants={itemVariants}>
        <h2>Key Features</h2>
        <div className="features-list">
          <div className="feature">
            <h4>✅ No Auth Required</h4>
            <p>Direct HTTP POST. No API keys, tokens, or credentials.</p>
          </div>
          <div className="feature">
            <h4>🎯 Wallet-Driven</h4>
            <p>Users bring their own wallet (Metamask, Coinbase). Earnings tracked automatically.</p>
          </div>
          <div className="feature">
            <h4>🔄 Agent ID Reuse</h4>
            <p>Register once, reuse Agent ID across searches. No re-registration overhead.</p>
          </div>
          <div className="feature">
            <h4>💸 Real Cashback</h4>
            <p>50,000+ merchants with live cashback rates and affiliate links.</p>
          </div>
          <div className="feature">
            <h4>🌐 Multi-Token</h4>
            <p>Users choose earning token: MON (native), BONK (community), or USDC (stable).</p>
          </div>
          <div className="feature">
            <h4>📈 Analytics Ready</h4>
            <p>Real-time stats on searches, conversions, and network growth.</p>
          </div>
        </div>
      </motion.section>

      {/* Response Format */}
      <motion.section className="doc-section response-format" variants={itemVariants}>
        <h2>Response Format</h2>
        <p>All responses follow JSON-RPC 2.0 standard with <code>content</code> array:</p>
        <pre className="code-block"><code>{`{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "## 🛍️ Search Results\\n\\n| Image | Product | ... |"
      }
    ]
  },
  "id": 1
}`}</code></pre>
        <p style={{ marginTop: '1rem' }}>Results are formatted as <strong>markdown</strong> with:</p>
        <ul>
          <li>Product images (inline)</li>
          <li>Price &amp; merchant info</li>
          <li>Cashback rates (%) and amounts ($)</li>
          <li>Affiliate links to purchase</li>
        </ul>
      </motion.section>

      {/* Resources */}
      <motion.section className="doc-section resources" variants={itemVariants}>
        <h2>Resources</h2>
        <div className="resources-grid">
          <a href="https://github.com/openclawlaurent/FiberAgent" className="resource-card" target="_blank" rel="noopener noreferrer">
            <h3>📦 GitHub Repository</h3>
            <p>Source code, skill files, full implementation</p>
          </a>
          <a href="https://github.com/openclawlaurent/FiberAgent/blob/main/MCP_INTEGRATION_GUIDE.md" className="resource-card" target="_blank" rel="noopener noreferrer">
            <h3>📖 Full Integration Guide</h3>
            <p>Complete documentation with detailed API specs</p>
          </a>
          <a href="https://github.com/openclawlaurent/FiberAgent/blob/main/MCP_QUICKSTART.md" className="resource-card" target="_blank" rel="noopener noreferrer">
            <h3>⚡ Quick Start Repo</h3>
            <p>5-minute setup guide for developers</p>
          </a>
          <a href="https://fiberagent.shop/developers" className="resource-card">
            <h3>🛠️ Developer Portal</h3>
            <p>More tools, OpenAPI spec, examples</p>
          </a>
        </div>
      </motion.section>

      {/* Support */}
      <motion.section className="doc-section support" variants={itemVariants}>
        <h2>📞 Support & Documentation</h2>
        
        <div className="support-channels">
          <div className="channel">
            <h3>🐛 Bug Reports & Issues</h3>
            <p><strong>Primary support channel:</strong></p>
            <a href="https://github.com/openclawlaurent/FiberAgent/issues" target="_blank" rel="noopener noreferrer" className="support-link">
              GitHub Issues
            </a>
            <p>Open an issue for bugs, feature requests, or integration problems. Include MCP method, request body, and error message.</p>
          </div>

          <div className="channel">
            <h3>📚 Documentation</h3>
            <p><strong>Complete guides available:</strong></p>
            <ul className="doc-links">
              <li><a href="https://github.com/openclawlaurent/FiberAgent/blob/main/MCP_INTEGRATION_GUIDE.md" target="_blank" rel="noopener noreferrer">Full MCP Integration Guide</a> (13KB, all tools & examples)</li>
              <li><a href="https://github.com/openclawlaurent/FiberAgent/blob/main/MCP_QUICKSTART.md" target="_blank" rel="noopener noreferrer">Quick Start Guide</a> (5 minutes to integration)</li>
              <li><a href="https://fiberagent.shop/docs/mcp">This page</a> (overview & code examples)</li>
              <li><a href="https://fiberagent.shop/developers">Developer Portal</a> (API specs, OpenAPI, more)</li>
            </ul>
          </div>

          <div className="channel">
            <h3>💬 Questions & Feedback</h3>
            <p><strong>General questions?</strong></p>
            <p>Check <a href="https://github.com/openclawlaurent/FiberAgent/discussions" target="_blank" rel="noopener noreferrer">GitHub Discussions</a> or open an issue on <a href="https://github.com/openclawlaurent/FiberAgent" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>
          </div>
        </div>

        <div className="sla-info">
          <h3>Response Times</h3>
          <ul>
            <li><strong>Bug reports:</strong> Response within 24 hours</li>
            <li><strong>Integration help:</strong> Response within 24-48 hours</li>
            <li><strong>Feature requests:</strong> Reviewed weekly</li>
          </ul>
        </div>
      </motion.section>
    </motion.div>
  );
}
