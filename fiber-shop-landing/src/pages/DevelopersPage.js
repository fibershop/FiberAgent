import React from 'react';
import { Helmet } from 'react-helmet-async';
import './DevelopersPage.css';

function DevelopersPage() {
  return (
    <>
      <Helmet>
        <title>FiberAgent Developer Hub</title>
        <meta name="description" content="API documentation, MCP integration, and code examples for building with FiberAgent." />
      </Helmet>

      <div className="developers-container">
        <header className="dev-header">
          <h1>Developer Hub</h1>
          <p className="dev-tagline">Build with FiberAgent. Earn crypto commissions on every purchase.</p>
        </header>

        {/* Quick Start */}
        <section className="dev-section">
          <h2>Quick Start</h2>
          <div className="quick-start-grid">
            <div className="quick-start-card">
              <div className="card-icon">🤖</div>
              <h3>Model Context Protocol (MCP)</h3>
              <p>Connect Claude Desktop to FiberAgent in 2 minutes.</p>
              <div className="code-snippet">
                <pre><code>{`{
  "mcpServers": {
    "fiberagent": {
      "url": "https://fiberagent.shop/api/mcp"
    }
  }
}`}</code></pre>
              </div>
              <a href="/capabilities" className="card-link">→ Full MCP Guide</a>
            </div>

            <div className="quick-start-card">
              <div className="card-icon">🔌</div>
              <h3>REST API</h3>
              <p>Standard JSON API for any LLM or application.</p>
              <div className="code-snippet">
                <pre><code>{`curl -X POST https://fiberagent.shop/api/agent/search \\
  -d '{"keywords":["running shoes"],"agent_id":"...","wallet":"0x..."}'`}</code></pre>
              </div>
              <a href="/capabilities" className="card-link">→ API Reference</a>
            </div>

            <div className="quick-start-card">
              <div className="card-icon">🔐</div>
              <h3>Agent Registration</h3>
              <p>Register your agent to start earning commissions.</p>
              <div className="code-snippet">
                <pre><code>{`POST /api/agent/register
{
  "agent_id": "my-agent",
  "wallet": "0x..."
}`}</code></pre>
              </div>
              <a href="/capabilities" className="card-link">→ Registration Docs</a>
            </div>
          </div>
        </section>

        {/* Integration Paths */}
        <section className="dev-section">
          <h2>Choose Your Integration Path</h2>
          <div className="integration-paths">
            <div className="path">
              <div className="path-badge">EASIEST</div>
              <h3>Claude Desktop</h3>
              <p>Copy-paste config, instant access to 50K+ products and cashback shopping.</p>
              <ul>
                <li>✓ No backend required</li>
                <li>✓ MCP protocol (standard)</li>
                <li>✓ ~2 minutes to integrate</li>
              </ul>
              <a href="/capabilities">Learn More →</a>
            </div>

            <div className="path">
              <div className="path-badge">FLEXIBLE</div>
              <h3>REST API</h3>
              <p>Build custom shopping experiences with our REST endpoints.</p>
              <ul>
                <li>✓ Any language/framework</li>
                <li>✓ Works with ChatGPT, local models, custom AI</li>
                <li>✓ Full control over UX</li>
              </ul>
              <a href="/capabilities">Learn More →</a>
            </div>

            <div className="path">
              <div className="path-badge">POWERFUL</div>
              <h3>OpenClaw Skill</h3>
              <p>Integrate into local AI assistants with our published skill.</p>
              <ul>
                <li>✓ npm installable</li>
                <li>✓ Auto-discovered by agents</li>
                <li>✓ Full feature parity</li>
              </ul>
              <code>npm install github:openclawlaurent/FiberAgent#v1.0.1</code>
              <a href="https://github.com/openclawlaurent/FiberAgent" target="_blank" rel="noopener noreferrer">View on GitHub →</a>
            </div>
          </div>
        </section>

        {/* Key Concepts */}
        <section className="dev-section">
          <h2>Key Concepts</h2>
          
          <div className="concepts">
            <div className="concept">
              <h3>🛍️ How Shopping Works</h3>
              <ol>
                <li><strong>User asks:</strong> "Find me running shoes"</li>
                <li><strong>Your agent:</strong> Calls FiberAgent API/MCP to find best deals</li>
                <li><strong>FiberAgent:</strong> Returns 50K+ products ranked by price + cashback</li>
                <li><strong>User buys:</strong> Through affiliate link (best option for them)</li>
                <li><strong>Your agent earns:</strong> Crypto commission (trustless, global)</li>
              </ol>
              <p>The goal: help your user find the best deal. Your agent earns when the user gets value.</p>
            </div>

            <div className="concept">
              <h3>💰 How You Earn</h3>
              <p><strong>Example: User buys $100 item with 15% affiliate rate</strong></p>
              <div className="flow-chart">
                <div className="flow-item">
                  <span>User pays</span>
                  <strong>$100</strong>
                </div>
                <div className="flow-arrow">→</div>
                <div className="flow-item">
                  <span>Merchant pays you</span>
                  <strong>$15 commission</strong>
                </div>
                <div className="flow-arrow">→</div>
                <div className="flow-item">
                  <span>You decide with user</span>
                  <strong>Cashback or spend</strong>
                </div>
              </div>
              <p><strong>You get 100% of the affiliate commission via crypto.</strong> Crypto is the only trustless way for agents to receive payments globally without banks, KYC, or middlemen. Then you and your user decide what to do with it:</p>
              <ul>
                <li>✓ User asks for cashback → you send crypto to their wallet</li>
                <li>✓ User tells you to spend it → you buy them credits, other products, donate it, etc.</li>
                <li>✓ You both manage it together → your agent is their financial proxy</li>
              </ul>
              <p className="note">💡 Timeline: Commission arrives after 30-90 day refund window (varies by merchant). You manage how it flows to the user. Crypto enables this without middlemen.</p>
            </div>

            <div className="concept">
              <h3>⛓️ On-Chain Verification</h3>
              <p>All agent registrations are recorded on-chain via ERC-8004 standard.</p>
              <p><strong>FiberAgent Agent #135:</strong> <a href="https://www.8004scan.io/agents/monad/135" target="_blank" rel="noopener noreferrer">First & only commerce agent registered</a></p>
              <p>When you register, you'll receive a token ID for transparent, verifiable identity.</p>
            </div>

            <div className="concept">
              <h3>🔓 No API Keys Required</h3>
              <p>FiberAgent is completely open:</p>
              <ul>
                <li>✓ No authentication needed</li>
                <li>✓ No rate limiting</li>
                <li>✓ No quotas or tiers</li>
                <li>✓ Use for free, forever</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="dev-section pricing-section">
          <h2>Pricing</h2>
          <div className="pricing-box">
            <h3>Free Tier</h3>
            <div className="pricing-item">
              <span>API calls</span>
              <strong>Unlimited</strong>
            </div>
            <div className="pricing-item">
              <span>Agents registered</span>
              <strong>Unlimited</strong>
            </div>
            <div className="pricing-item">
              <span>Products searchable</span>
              <strong>50K+</strong>
            </div>
            <div className="pricing-item">
              <span>Commission rate</span>
              <strong>Varies by merchant (0.65%-15%)</strong>
            </div>
            <div className="pricing-item">
              <span>Setup fee</span>
              <strong>$0</strong>
            </div>
            <div className="pricing-item">
              <span>Monthly fee</span>
              <strong>$0</strong>
            </div>
            <p className="pricing-note">🎉 No freemium. No upsell. Just earn.</p>
          </div>
        </section>

        {/* Documentation Links */}
        <section className="dev-section">
          <h2>Full Documentation</h2>
          <div className="doc-links">
            <a href="/capabilities" className="doc-link">
              <div className="doc-icon">📋</div>
              <div>
                <h3>API Reference</h3>
                <p>Complete tool schemas, resources, and examples</p>
              </div>
            </a>

            <a href="https://github.com/openclawlaurent/FiberAgent" target="_blank" rel="noopener noreferrer" className="doc-link">
              <div className="doc-icon">🔧</div>
              <div>
                <h3>GitHub Repository</h3>
                <p>Source code, skills, and integration guides</p>
              </div>
            </a>

            <a href="/onepager" className="doc-link">
              <div className="doc-icon">📊</div>
              <div>
                <h3>Product Overview</h3>
                <p>Vision, market opportunity, and strategy</p>
              </div>
            </a>

            <a href="/visual-demo" className="doc-link">
              <div className="doc-icon">🎬</div>
              <div>
                <h3>Visual Demo</h3>
                <p>Interactive walkthrough of FiberAgent in action</p>
              </div>
            </a>
          </div>
        </section>

        {/* Support */}
        <section className="dev-section dev-support">
          <h2>Get Support</h2>
          <p>Questions? Issues? Want to contribute?</p>
          <div className="support-links">
            <a href="https://github.com/openclawlaurent/FiberAgent/issues" target="_blank" rel="noopener noreferrer">GitHub Issues</a>
            <a href="https://github.com/openclawlaurent/FiberAgent/discussions" target="_blank" rel="noopener noreferrer">Discussions</a>
            <a href="https://twitter.com/fiberagent" target="_blank" rel="noopener noreferrer">Twitter</a>
          </div>
        </section>
      </div>
    </>
  );
}

export default DevelopersPage;
