import React from 'react';
import { Helmet } from 'react-helmet-async';
import './CapabilitiesPage.css';

function CapabilitiesPage() {
  const agentCard = {
    "@context": "https://schema.org",
    "name": "FiberAgent",
    "description": "AI commerce agent for shopping with crypto cashback. Sits between personal AIs (Claude, ChatGPT, OpenClaw) and 50K+ merchants via Fiber API.",
    "url": "https://fiberagent.shop",
    "version": "1.0.1",
    "status": "live",
    "endpoints": {
      "mcp": "https://fiberagent.shop/api/mcp",
      "rest_api": "https://fiberagent.shop/api/agent",
      "openapi": "https://fiberagent.shop/openapi.json"
    },
    "capabilities": [
      "Model Context Protocol (MCP) - Streamable HTTP",
      "REST API - JSON",
      "Agent-to-Agent (A2A) discovery",
      "OpenAPI specification"
    ],
    "tools": [
      {
        "name": "search_products",
        "description": "Search 50K+ merchants for products with cashback rates",
        "params": ["keywords", "agent_id", "wallet"]
      },
      {
        "name": "register_agent",
        "description": "Register new agent and get wallet-based commission tracking",
        "params": ["agent_id", "wallet", "name", "description"]
      },
      {
        "name": "get_agent_stats",
        "description": "Retrieve agent earnings and statistics",
        "params": ["agent_id"]
      }
    ],
    "skills": [
      {
        "name": "fiberagent",
        "version": "1.0.1",
        "description": "OpenClaw skill for FiberAgent commerce integration",
        "repository": "https://github.com/openclawlaurent/FiberAgent",
        "installable": "npm install github:openclawlaurent/FiberAgent#v1.0.1"
      }
    ],
    "authentication": "None (public API)",
    "rateLimit": "Unlimited for now",
    "blockchain": {
      "network": "Monad",
      "standard": "ERC-8004",
      "agentId": "135",
      "registry": "https://www.8004scan.io/agents/monad/135"
    },
    "commerce": {
      "merchants": "50K+",
      "commissionRange": "0.65% - 15%",
      "currencies": "Multiple (merchant-dependent)",
      "settlement": "Crypto (trustless, no middlemen)"
    },
    "support": {
      "documentation": "https://fiberagent.shop/about",
      "github": "https://github.com/openclawlaurent/FiberAgent",
      "live_demo": "https://fiberagent.shop/visual-demo"
    }
  };

  return (
    <>
      <Helmet>
        <title>FiberAgent Capabilities & Technical Specs</title>
        <meta name="description" content="FiberAgent agent card, MCP endpoint, API specs, and technical capabilities." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "FiberAgent",
            "description": "Crypto-native AI commerce agent. Search products, earn cashback commissions via AI chat.",
            "url": "https://fiberagent.shop",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "category": "AI Agent, Commerce",
              "availability": "InStock",
              "priceCurrency": "N/A (Free)"
            },
            "potentialAction": {
              "@type": "UseAction",
              "target": "https://fiberagent.shop/api/mcp",
              "name": "Model Context Protocol (MCP) Endpoint"
            }
          })}
        </script>
      </Helmet>

      <div className="capabilities-container">
        <header className="cap-header">
          <h1>FiberAgent Capabilities</h1>
          <p className="cap-subtitle">Technical Specifications & Integration Guide</p>
        </header>

        {/* Quick Links */}
        <section className="cap-section cap-quick-links">
          <h2>Quick Links</h2>
          <div className="link-grid">
            <a href="https://fiberagent.shop/api/mcp" className="link-card">
              <div className="link-icon">📡</div>
              <div className="link-text">
                <strong>MCP Endpoint</strong>
                <p>Model Context Protocol (Streamable HTTP)</p>
              </div>
            </a>
            <a href="https://fiberagent.shop/openapi.json" className="link-card">
              <div className="link-icon">📋</div>
              <div className="link-text">
                <strong>OpenAPI Spec</strong>
                <p>REST API specification (JSON)</p>
              </div>
            </a>
            <a href="https://www.8004scan.io/agents/monad/135" target="_blank" rel="noopener noreferrer" className="link-card">
              <div className="link-icon">⛓️</div>
              <div className="link-text">
                <strong>ERC-8004 Registry</strong>
                <p>On-chain agent registration (Monad)</p>
              </div>
            </a>
            <a href="https://github.com/openclawlaurent/FiberAgent" target="_blank" rel="noopener noreferrer" className="link-card">
              <div className="link-icon">🔧</div>
              <div className="link-text">
                <strong>GitHub</strong>
                <p>Source code & OpenClaw skill</p>
              </div>
            </a>
          </div>
        </section>

        {/* Agent Card */}
        <section className="cap-section">
          <h2>Agent Card (JSON)</h2>
          <p className="section-desc">Complete agent registration card in JSON format. This is the canonical source for FiberAgent's capabilities and endpoints.</p>
          
          <div className="code-section">
            <div className="code-header">
              <span>agent-card.json</span>
              <button onClick={() => navigator.clipboard.writeText(JSON.stringify(agentCard, null, 2))} className="copy-btn">Copy</button>
            </div>
            <pre className="code-block"><code>{JSON.stringify(agentCard, null, 2)}</code></pre>
          </div>
        </section>

        {/* MCP Protocol */}
        <section className="cap-section">
          <h2>Model Context Protocol (MCP)</h2>
          <p className="section-desc">FiberAgent implements the Model Context Protocol standard, enabling seamless integration with Claude, ChatGPT, and any MCP-compatible LLM client.</p>
          
          <div className="mcp-overview">
            <div className="mcp-stat">
              <div className="mcp-stat-label">Protocol Version</div>
              <div className="mcp-stat-value">MCP 1.0.0</div>
            </div>
            <div className="mcp-stat">
              <div className="mcp-stat-label">Transport</div>
              <div className="mcp-stat-value">Streamable HTTP (SSE)</div>
            </div>
            <div className="mcp-stat">
              <div className="mcp-stat-label">Authentication</div>
              <div className="mcp-stat-value">None (open access)</div>
            </div>
            <div className="mcp-stat">
              <div className="mcp-stat-label">Rate Limiting</div>
              <div className="mcp-stat-value">Unlimited</div>
            </div>
          </div>

          <h3>MCP Tools (5)</h3>
          <div className="mcp-tools">
            <div className="mcp-tool">
              <strong>search_products</strong>
              <p>Search across 50K+ merchants for products with cashback rates</p>
              <code>POST /api/mcp (JSON-RPC)</code>
              <div className="tool-params">
                <div className="param">
                  <code>query</code> <span className="required">required</span>: Search terms (string)
                </div>
                <div className="param">
                  <code>max_results</code> <span className="optional">optional</span>: 1-20, default 5 (integer)
                </div>
              </div>
            </div>

            <div className="mcp-tool">
              <strong>search_by_intent</strong>
              <p>Natural language product search</p>
              <code>POST /api/mcp (JSON-RPC)</code>
              <div className="tool-params">
                <div className="param">
                  <code>intent</code> <span className="required">required</span>: Natural language request (string)
                </div>
                <div className="param">
                  <code>max_results</code> <span className="optional">optional</span>: 1-20, default 5 (integer)
                </div>
              </div>
            </div>

            <div className="mcp-tool">
              <strong>register_agent</strong>
              <p>Register agent to earn cashback commissions</p>
              <code>POST /api/mcp (JSON-RPC)</code>
              <div className="tool-params">
                <div className="param">
                  <code>agent_id</code> <span className="required">required</span>: Unique ID (string)
                </div>
                <div className="param">
                  <code>agent_name</code> <span className="optional">optional</span>: Human-readable name (string)
                </div>
                <div className="param">
                  <code>wallet</code> <span className="required">required</span>: Monad wallet (0x...) (string)
                </div>
              </div>
            </div>

            <div className="mcp-tool">
              <strong>get_agent_stats</strong>
              <p>Get agent earnings, searches, and metrics</p>
              <code>POST /api/mcp (JSON-RPC)</code>
              <div className="tool-params">
                <div className="param">
                  <code>agent_id</code> <span className="required">required</span>: Registered agent ID (string)
                </div>
              </div>
            </div>

            <div className="mcp-tool">
              <strong>compare_cashback</strong>
              <p>Compare cashback across merchants for same product</p>
              <code>POST /api/mcp (JSON-RPC)</code>
              <div className="tool-params">
                <div className="param">
                  <code>product_name</code> <span className="required">required</span>: Product title (string)
                </div>
                <div className="param">
                  <code>max_merchants</code> <span className="optional">optional</span>: 1-10, default 5 (integer)
                </div>
              </div>
            </div>
          </div>

          <h3>MCP Resources (3)</h3>
          <div className="mcp-resources">
            <div className="mcp-resource">
              <code>fiber://merchants/catalog</code> — Full product catalog with 50K+ merchants, inventory, rates, domains
            </div>
            <div className="mcp-resource">
              <code>fiber://agent-card</code> — Agent registration card with wallet, registration date, stats, on-chain verification
            </div>
            <div className="mcp-resource">
              <code>fiber://rates/top</code> — Top cashback merchants by category, sorted by opportunity
            </div>
          </div>

          <h3>MCP Setup (Claude Desktop)</h3>
          <div className="code-section">
            <div className="code-header">claude_desktop_config.json</div>
            <pre className="code-block"><code>{`{
  "mcpServers": {
    "fiberagent": {
      "url": "https://fiberagent.shop/api/mcp"
    }
  }
}`}</code></pre>
          </div>

          <p className="resource-note">
            📖 Full MCP integration guide with cURL, Python, Node.js, and JavaScript examples: <a href="https://github.com/openclawlaurent/FiberAgent/blob/main/MCP_INTEGRATION_GUIDE.md" target="_blank" rel="noopener noreferrer">MCP_INTEGRATION_GUIDE.md</a>
          </p>
        </section>

        {/* Endpoints */}
        <section className="cap-section">
          <h2>Available Endpoints</h2>
          
          <div className="endpoint-item">
            <h3>🔌 Model Context Protocol (MCP)</h3>
            <p><strong>URL:</strong> <code>https://fiberagent.shop/api/mcp</code></p>
            <p><strong>Protocol:</strong> Streamable HTTP (Server-Sent Events)</p>
            <p><strong>Use Case:</strong> Claude Desktop, Claude.ai, and compatible LLM clients</p>
            <p className="endpoint-desc">
              Provides MCP tools for product search, agent registration, and stats. Requires MCP client support. Zero authentication.
            </p>
            <div className="code-section">
              <div className="code-header">Claude Desktop Config</div>
              <pre className="code-block"><code>{`{
  "mcpServers": {
    "fiberagent": {
      "url": "https://fiberagent.shop/api/mcp"
    }
  }
}`}</code></pre>
            </div>
          </div>

          <div className="endpoint-item">
            <h3>📡 REST API</h3>
            <p><strong>Base URL:</strong> <code>https://fiberagent.shop/api/agent</code></p>
            <p><strong>Protocol:</strong> JSON over HTTP</p>
            <p><strong>Use Case:</strong> Any LLM, agent, or custom integration via REST calls</p>
            <p className="endpoint-desc">
              Standard REST endpoints for searching products, registering agents, and retrieving stats. No auth required.
            </p>
            
            <div className="endpoints-list">
              <div className="endpoint-detail">
                <strong>POST /api/agent/register</strong>
                <p>Register a new agent</p>
                <pre><code>{`{
  "agent_id": "claude-shopping-001",
  "name": "Claude Shopping Agent",
  "description": "My personal shopping assistant",
  "wallet": "0x790b405d..."
}`}</code></pre>
              </div>
              
              <div className="endpoint-detail">
                <strong>GET /api/agent/search</strong>
                <p>Search products across merchants</p>
                <pre><code>{`Query Parameters:
  keywords: ["hiking", "boots"] (required)
  agent_id: "claude-shopping-001" (required)
  wallet: "0x..." (required for earnings tracking)`}</code></pre>
              </div>

              <div className="endpoint-detail">
                <strong>GET /api/agent/{`{id}`}/stats</strong>
                <p>Get agent performance metrics</p>
                <pre><code>{`Returns:
  - Total searches: number
  - Commission rate: %
  - Potential earnings: crypto amount
  - Sample transactions: []`}</code></pre>
              </div>
            </div>
          </div>

          <div className="endpoint-item">
            <h3>📋 OpenAPI Specification</h3>
            <p><strong>URL:</strong> <code>https://fiberagent.shop/openapi.json</code></p>
            <p><strong>Format:</strong> OpenAPI 3.0 JSON</p>
            <p><strong>Use Case:</strong> API client generation, documentation, discovery tools</p>
            <p className="endpoint-desc">
              Full OpenAPI specification for REST API. Can be imported into Postman, Swagger UI, or code generators.
            </p>
          </div>
        </section>

        {/* Tools & Features */}
        <section className="cap-section">
          <h2>Tools & Features</h2>
          
          <div className="tools-grid">
            <div className="tool-card">
              <h4>🔍 Search Products</h4>
              <p>Query 50K+ merchants with real-time cashback rates and affiliate links.</p>
              <ul>
                <li>Keyword-based search</li>
                <li>Real merchant data</li>
                <li>Affiliate rates: 0.65% - 15%</li>
                <li>Instant results</li>
              </ul>
            </div>

            <div className="tool-card">
              <h4>📝 Register Agent</h4>
              <p>One-time agent registration for commission tracking and on-chain verification.</p>
              <ul>
                <li>Zero friction signup</li>
                <li>Wallet-based identity</li>
                <li>Instant activation</li>
                <li>Global reach</li>
              </ul>
            </div>

            <div className="tool-card">
              <h4>📊 Get Stats</h4>
              <p>Monitor agent performance, earnings, and transaction history.</p>
              <ul>
                <li>Commission tracking</li>
                <li>Search metrics</li>
                <li>Earnings projections</li>
                <li>Real-time updates</li>
              </ul>
            </div>

            <div className="tool-card">
              <h4>🎯 Task Processing</h4>
              <p>Convert natural language intent into product searches with context.</p>
              <ul>
                <li>Natural language input</li>
                <li>Intent parsing</li>
                <li>Smart filtering</li>
                <li>Ranked results</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className="cap-section">
          <h2>OpenClaw Skill</h2>
          <p className="section-desc">FiberAgent is distributed as an OpenClaw skill for easy integration into local AI assistants.</p>
          
          <div className="skill-box">
            <h3>fiberagent v1.0.1</h3>
            <p><strong>Repository:</strong> <a href="https://github.com/openclawlaurent/FiberAgent" target="_blank" rel="noopener noreferrer">github.com/openclawlaurent/FiberAgent</a></p>
            <p><strong>Installation:</strong></p>
            <pre className="code-block"><code>npm install github:openclawlaurent/FiberAgent#v1.0.1</code></pre>
            <p><strong>Or:</strong> Copy <code>skills/fiberagent/</code> to <code>~/.openclaw/workspace/skills/</code> for auto-discovery</p>
            <p className="skill-desc">
              Provides OpenClaw integration for FiberAgent. Compatible with local personal AI assistants. Auto-discovered via semantic skill matching.
            </p>
          </div>
        </section>

        {/* Blockchain */}
        <section className="cap-section">
          <h2>Blockchain Integration</h2>
          <p className="section-desc">FiberAgent is registered on-chain for transparent, verifiable agent identity and capabilities.</p>
          
          <div className="blockchain-box">
            <div className="blockchain-detail">
              <strong>Network:</strong> <span>Monad (mainnet)</span>
            </div>
            <div className="blockchain-detail">
              <strong>Standard:</strong> <span>ERC-8004 (Agent Registry)</span>
            </div>
            <div className="blockchain-detail">
              <strong>Agent ID:</strong> <span>#135</span>
            </div>
            <div className="blockchain-detail">
              <strong>Status:</strong> <span>✅ Only commerce agent on Monad</span>
            </div>
            <div className="blockchain-detail">
              <strong>Registry Link:</strong> <span><a href="https://www.8004scan.io/agents/monad/135" target="_blank" rel="noopener noreferrer">8004scan.io/agents/monad/135</a></span>
            </div>
          </div>
        </section>

        {/* Integration Examples */}
        <section className="cap-section">
          <h2>Integration Examples</h2>
          
          <div className="example-item">
            <h3>Example 1: Direct REST Call (cURL)</h3>
            <pre className="code-block"><code>{`curl -X GET "https://fiberagent.shop/api/agent/search" \\
  -d '{"keywords":["hiking boots"],"agent_id":"my-agent","wallet":"0x..."}'`}</code></pre>
          </div>

          <div className="example-item">
            <h3>Example 2: Python Integration</h3>
            <pre className="code-block"><code>{`import requests

response = requests.post(
  "https://fiberagent.shop/api/agent/search",
  json={
    "keywords": ["hiking boots"],
    "agent_id": "my-agent",
    "wallet": "0x..."
  }
)

products = response.json()["products"]
for p in products:
  print(f"{p['name']}: {p['price']} - {p['cashback_amount']} cashback")`}</code></pre>
          </div>

          <div className="example-item">
            <h3>Example 3: MCP Client (Node.js)</h3>
            <pre className="code-block"><code>{`import { Client } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({
  command: "npx",
  args: ["fiberagent"], // or direct curl to https://fiberagent.shop/api/mcp
});

const response = await client.request("search_products", {
  keywords: ["hiking boots"],
  agent_id: "my-agent"
});`}</code></pre>
          </div>
        </section>

        {/* Support */}
        <section className="cap-section cap-support">
          <h2>Support & Resources</h2>
          <div className="support-grid">
            <a href="https://github.com/openclawlaurent/FiberAgent" target="_blank" rel="noopener noreferrer" className="support-card">
              <strong>GitHub</strong>
              <p>Source code, issues, and discussions</p>
            </a>
            <a href="https://fiberagent.shop/visual-demo" className="support-card">
              <strong>Live Demo</strong>
              <p>Interactive walkthrough of FiberAgent</p>
            </a>
            <a href="https://fiberagent.shop/onepager" className="support-card">
              <strong>One-Pager</strong>
              <p>Business overview and market opportunity</p>
            </a>
            <a href="https://fiberagent.shop/about" className="support-card">
              <strong>About</strong>
              <p>Team, mission, and contact info</p>
            </a>
          </div>
        </section>
      </div>
    </>
  );
}

export default CapabilitiesPage;
